const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');
const { pipeline } = require('@huggingface/transformers');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Preload NER pipeline
let nerPipeline;
(async () => {
  try {
    nerPipeline = await pipeline('token-classification', 'Xenova/bert-base-multilingual-cased-ner-hrl');
    console.log('NER model loaded');
  } catch (error) {
    console.error('Failed to load NER pipeline:', error.message);
  }
})();

// Upload resume and process candidate
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No resume file uploaded.' });

  try {
    const file = req.file;
    const filePath = `resumes/${Date.now()}-${file.originalname}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ msg: 'Failed to upload resume', error: uploadError.message });
    }

    // Parse PDF text
    const { text: resumeText } = await pdf(file.buffer);
    let entities = [];

    // NER processing
    if (nerPipeline) {
      try {
        entities = await nerPipeline(resumeText.substring(0, 10000));
      } catch (nerError) {
        console.warn('NER processing failed:', nerError.message);
      }
    }

    // Extract name from NER
    let currentNameParts = [], allNames = [], extractedName = null;
    for (const entity of entities) {
      if (entity.entity === 'B-PER' && entity.score > 0.8) {
        if (currentNameParts.length > 0) {
          allNames.push(currentNameParts.map(p => p.replace(/^##/, '')).join(' ').trim());
        }
        currentNameParts = [entity.word];
      } else if (entity.entity === 'I-PER' && currentNameParts.length > 0) {
        currentNameParts.push(entity.word);
      } else {
        if (currentNameParts.length > 0) {
          allNames.push(currentNameParts.map(p => p.replace(/^##/, '')).join(' ').trim());
          currentNameParts = [];
        }
      }
    }
    if (currentNameParts.length > 0) {
      allNames.push(currentNameParts.map(p => p.replace(/^##/, '')).join(' ').trim());
    }

    const validNames = allNames.filter(n => n.length > 1 && (n.includes(' ') || n.length > 3));
    extractedName = validNames.sort((a, b) => b.length - a.length)[0] || null;

    // Fallback name heuristic
    if (!extractedName || extractedName.length < 5) {
      const lines = resumeText.split('\n').slice(0, 10);
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^[a-zA-Z\s'-]{5,50}$/.test(trimmed) &&
          !/email|phone|linkedin|github|http/i.test(trimmed)) {
          extractedName = trimmed;
          break;
        }
      }
    }

    // Extract email
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    const extractedEmail = emailMatch?.[0] || null;

    // Extract phone
    const phoneMatch = resumeText.match(/\+?\d{10,13}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
    const extractedPhone = phoneMatch?.[0] || null;

    // Extract links
    const githubMatches = resumeText.match(/github\.com\/[^\s)]+/gi) || [];
    const linkedinMatches = resumeText.match(/linkedin\.com\/in\/[^\s)]+/gi) || [];
    const otherMatches = resumeText.match(/https?:\/\/(?!.*(github|linkedin))[\w./?=#-]+/gi) || [];

    // Enhanced education parsing logic
    const educationPatterns = {
      degree: /\b(B\.Tech|B\.E|B\.Sc|B\.A|B\.Com|BBA|M\.Tech|M\.E|M\.Sc|M\.A|MBA|PhD|Bachelor|Master|Doctorate|Ph\.D|CSE|Computer Science|AI|Machine Learning)\b/i,
      institution: /\b(University|Institute|College|School|Academy|VVIT|Vasireddy Venkatadri Institute of Technology|Chaitanya|Bhashyam)\b/i,
      years: /\b(\d{4}-\d{4}|\d{4} to \d{4}|\d{4} - \d{4}|\d{4})\b/i,
      grade: /\b(\d+\.\d+|\d+%)\b/i
    };

    // Extract education details
    const educationText = resumeText.match(/(Education|Academic|Qualification|University|College|Institute)[^\n]*\n([^\n]*\n)*?(?=\n\n|\n[A-Z]|$)/gi) || [];
    
    const parsedEducation = educationText.map(section => {
      const lines = section.trim().split('\n').map(line => line.trim());
      
      // Find degree
      const degreeLine = lines.find(line => educationPatterns.degree.test(line));
      const degree = degreeLine ? degreeLine.match(educationPatterns.degree)[0] : '';
      
      // Find institution
      const institutionLine = lines.find(line => educationPatterns.institution.test(line));
      const institution = institutionLine ? institutionLine : '';
      
      // Find years
      const yearsLine = lines.find(line => educationPatterns.years.test(line));
      const years = yearsLine ? yearsLine.match(educationPatterns.years)[0] : '';
      
      // Find grade
      const gradeLine = lines.find(line => educationPatterns.grade.test(line));
      const grade = gradeLine ? gradeLine.match(educationPatterns.grade)[0] : '';
      
      // Clean up institution name
      const institutionClean = institution.replace(/\b(University|Institute|College|School|Academy)\b/i, '').trim();
      
      return {
        degree: degree.trim(),
        institution: institutionClean.trim(),
        years: years.trim(),
        grade: grade.trim(),
        fullText: section.trim()
      };
    }).filter(entry => entry.degree || entry.institution); // Remove empty entries

    // Prepare candidate data
    const parsedLinks = {
      github: githubMatches,
      linkedin: linkedinMatches,
      other: otherMatches
    };

    const parsedLinksString = [...githubMatches, ...linkedinMatches, ...otherMatches].join(', ');

    // Upsert or create candidate
    let candidate;
    try {
      if (extractedEmail) {
        candidate = await prisma.candidate.upsert({
          where: { email: extractedEmail },
          update: {
            name: extractedName || undefined,
            resumeUrl: uploadData.path,
            parsedName: extractedName,
            parsedPhone: extractedPhone,
            parsedEducation: parsedEducation ? JSON.stringify(parsedEducation) : null,
            parsedLinks: parsedLinks ? JSON.stringify(parsedLinks) : null
          },
          create: {
            name: extractedName || `Resume Candidate ${Date.now()}`,
            email: extractedEmail,
            resumeUrl: uploadData.path,
            parsedName: extractedName,
            parsedPhone: extractedPhone,
            parsedEducation: parsedEducation ? JSON.stringify(parsedEducation) : null,
            parsedLinks: parsedLinks ? JSON.stringify(parsedLinks) : null,
            status: 'NEW'
          }
        });
      } else {
        candidate = await prisma.candidate.create({
          data: {
            name: extractedName || `Candidate ${Date.now()}`,
            email: `candidate-${Date.now()}@example.com`,
            resumeUrl: uploadData.path,
            parsedName: extractedName,
            parsedPhone: extractedPhone,
            parsedEducation: parsedEducation,
            parsedLinks: parsedLinks,
            status: 'NEW'
          }
        });
      }
    } catch (prismaError) {
      console.error('Database error:', prismaError.message);
      return res.status(500).json({ msg: 'Failed to save candidate', error: prismaError.message });
    }

    res.status(201).json({
      message: 'Resume processed successfully',
      candidate,
      text: resumeText,
      entities
    });

  } catch (error) {
    console.error('Resume processing error:', error);
    res.status(500).json({ msg: 'Failed to process resume', error: error.message });
  }
});

// Update candidate info
router.put('/update-candidate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, education, githubLinks, linkedinLinks, otherLinks, status } = req.body;

    const candidate = await prisma.candidate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        education: education || [],
        githubLinks: githubLinks || [],
        linkedinLinks: linkedinLinks || [],
        otherLinks: otherLinks || [],
        status
      }
    });

    res.json({ message: 'Candidate updated successfully', candidate });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ msg: 'Failed to update candidate', error: error.message });
  }
});

module.exports = router;
