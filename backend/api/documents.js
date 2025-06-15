const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');
const prisma = new PrismaClient();

// Protect all document routes
router.use(verifyToken);

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/documents/upload — Upload document to Supabase and DB
router.post('/upload', upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded.' });

  try {
    const file = req.file;
    const filePath = `${Date.now()}-${file.originalname}`;

    try {
      // Get the user's ID from auth token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('No authentication token provided');
      }

      // Upload the raw file buffer to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
          metadata: {
            uploaded_at: new Date().toISOString(),
            file_type: file.mimetype
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL for the file
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${filePath}`;
      
      // Verify the file exists at the public URL
      const response = await fetch(publicUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
        }
      });

      if (!response.ok) {
        throw new Error(`File not accessible at public URL: ${response.statusText}`);
      }

      // Store the document information in the database
      const document = await prisma.document.create({
        data: {
          filename: filePath,
          filepath: uploadData.path,
          mimetype: file.mimetype,
          size: file.size,
          originalName: file.originalname
        },
      });

      return document;

    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }

    if (uploadError) throw uploadError;

    const document = await prisma.document.create({
      data: {
        filename: filePath,
        filepath: uploadData.path,
        mimetype: file.mimetype,
        size: file.size,
        originalName: file.originalname,
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ msg: 'Failed to upload document.' });
  }
});

// GET /api/documents — List all uploaded documents
router.get('/', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(documents);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).send('Server Error');
  }
});

// GET /api/documents/:id/download — Download file via public URL
router.get('/:id/download', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      console.error('Document not found in database:', documentId);
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Construct the public URL for the file in Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${document.filename}`;
    return res.redirect(publicUrl);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      msg: 'Server error during download', 
      error: error.message 
    });
  }
});

// DELETE /api/documents/:id — Delete document from DB and Supabase
router.delete('/:id', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.filename]);
    if (storageError) {
      return res.status(500).json({ msg: 'Failed to delete file from storage', error: storageError.message });
    }

    // Delete from database
    await prisma.document.delete({ where: { id: documentId } });

    res.json({ msg: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to delete document', error: error.message });
  }
});

module.exports = router;
