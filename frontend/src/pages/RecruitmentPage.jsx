import React, { useState } from 'react';
import api from '../services/api';
import './RecruitmentPage.css';
import { Box, Typography, TextField, Button, Grid, Paper, IconButton } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';

const RecruitmentPage = () => {
  // Helper function to group and simplify entities
  const groupEntities = (entities) => {
    if (!entities || entities.length === 0) return {};

    const grouped = {};
    let currentEntity = null;
    let currentWord = '';

    entities.forEach(entity => {
      const entityType = entity.entity.startsWith('B-') || entity.entity.startsWith('I-') 
                         ? entity.entity.substring(2) 
                         : entity.entity; // e.g., PER, ORG, LOC

      if (entity.entity.startsWith('B-')) {
        // If there was a previous entity, save it
        if (currentEntity) {
          if (!grouped[currentEntity]) grouped[currentEntity] = [];
          grouped[currentEntity].push(currentWord.trim());
        }
        // Start a new entity
        currentEntity = entityType;
        currentWord = entity.word.startsWith('##') ? entity.word.substring(2) : entity.word;
      } else if (entity.entity.startsWith('I-') && currentEntity === entityType) {
        // Continue current entity
        currentWord += entity.word.startsWith('##') ? entity.word.substring(2) : (' ' + entity.word);
      } else {
        // Unrelated token or different entity type, save previous if exists
        if (currentEntity) {
          if (!grouped[currentEntity]) grouped[currentEntity] = [];
          grouped[currentEntity].push(currentWord.trim());
          currentEntity = null;
          currentWord = '';
        }
        // Could also handle 'O' tags or start a new B-tag if it's a misaligned I-tag
        // For now, we reset if it's not a continuation
      }
    });

    // Add the last processed entity
    if (currentEntity && currentWord) {
      if (!grouped[currentEntity]) grouped[currentEntity] = [];
      grouped[currentEntity].push(currentWord.trim());
    }
    
    // Remove duplicates from each category
    for (const key in grouped) {
      grouped[key] = [...new Set(grouped[key])];
    }

    return grouped;
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [extractedEntities, setExtractedEntities] = useState([]);
  const [editing, setEditing] = useState(false);
  const [candidateData, setCandidateData] = useState({
    name: '',
    email: '',
    phone: '',
    education: [],
    githubLinks: [],
    linkedinLinks: [],
    otherLinks: [],
    status: 'NEW'
  });
  const [success, setSuccess] = useState('');

  // Function to save candidate data
  const handleSave = async () => {
    if (!candidateData.id) {
      setError('No candidate data found to save.');
      return;
    }

    try {
      const response = await api.put(`/recruitment/update-candidate/${candidateData.id}`, {
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        education: candidateData.education,
        githubLinks: candidateData.githubLinks,
        linkedinLinks: candidateData.linkedinLinks,
        otherLinks: candidateData.otherLinks,
        status: candidateData.status
      });

      setCandidateData(response.data.candidate);
      setEditing(false);
      setError('');
      setSuccess('Candidate data saved successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save candidate data. Please try again.');
      console.error('Error saving candidate data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize candidate data from parsed data
  React.useEffect(() => {
    if (parsedData && parsedData.candidate) {
      setCandidateData({
        id: parsedData.candidate.id,
        name: parsedData.candidate.parsedName || '',
        email: parsedData.candidate.email || '',
        phone: parsedData.candidate.parsedPhone || '',
        education: Array.isArray(parsedData.candidate.parsedEducation) 
          ? parsedData.candidate.parsedEducation 
          : [],
        githubLinks: Array.isArray(parsedData.candidate.parsedLinks?.github) 
          ? parsedData.candidate.parsedLinks.github 
          : [],
        linkedinLinks: Array.isArray(parsedData.candidate.parsedLinks?.linkedin) 
          ? parsedData.candidate.parsedLinks.linkedin 
          : [],
        otherLinks: Array.isArray(parsedData.candidate.parsedLinks?.other) 
          ? parsedData.candidate.parsedLinks.other 
          : [],
        status: parsedData.candidate.status || 'NEW'
      });
    } else {
      setCandidateData({
        name: '',
        email: '',
        phone: '',
        education: [],
        githubLinks: [],
        linkedinLinks: [],
        otherLinks: [],
        status: 'NEW'
      });
    }
  }, [parsedData]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setParsedData(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/recruitment/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Set timeout to 30 seconds
      });
      
      console.log('Frontend received response:', response.data);
      console.log('Frontend received response.data.text:', response.data.text);
      
      // Update parsed data state
      setParsedData(response.data);
      setError('');
      setSuccess('Resume processed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      if (error.response) {
        setError(`Error: ${error.response.data.msg || 'Failed to process resume'}`);
        console.error('Server response:', error.response.data);
      } else if (error.request) {
        setError('No response received from server');
        console.error('Request failed:', error.request);
      } else {
        setError('Error setting up request');
        console.error('Error:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recruitment-page">
      <h1>Resume Parser</h1>
      <div className="resume-uploader">
        <p>Upload a candidate's resume (PDF only) to automatically extract their information.</p>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={isLoading}>
          {isLoading ? 'Parsing...' : 'Parse Resume'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {parsedData && (
        <div className="parsed-results">
          <h2>Resume Parsing Results</h2>
          <Grid container spacing={3}>
            {/* Candidate Information Form */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Candidate Information</Typography>
                <Grid container spacing={2}>
                  {/* Contact Information */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Contact Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={candidateData.name}
                          onChange={(e) => setCandidateData({ ...candidateData, name: e.target.value })}
                          disabled={!editing}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={candidateData.email}
                          onChange={(e) => setCandidateData({ ...candidateData, email: e.target.value })}
                          disabled={!editing}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={candidateData.phone}
                          onChange={(e) => setCandidateData({ ...candidateData, phone: e.target.value })}
                          disabled={!editing}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Education */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Education</Typography>
                    <Grid container spacing={2}>
                      {(Array.isArray(candidateData.education) && candidateData.education.length > 0) ? (
                        candidateData.education.map((edu, index) => (
                          <Grid item xs={12} key={index}>
                            <Paper sx={{ p: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label={`Degree ${index + 1}`}
                                    value={edu.degree || ''}
                                    onChange={(e) => {
                                      const newEdu = [...candidateData.education];
                                      newEdu[index] = {
                                        ...newEdu[index],
                                        degree: e.target.value
                                      };
                                      setCandidateData({ ...candidateData, education: newEdu });
                                    }}
                                    disabled={!editing}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label={`Institution ${index + 1}`}
                                    value={edu.institution || ''}
                                    onChange={(e) => {
                                      const newEdu = [...candidateData.education];
                                      newEdu[index] = {
                                        ...newEdu[index],
                                        institution: e.target.value
                                      };
                                      setCandidateData({ ...candidateData, education: newEdu });
                                    }}
                                    disabled={!editing}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label={`Years ${index + 1}`}
                                    value={edu.years || ''}
                                    onChange={(e) => {
                                      const newEdu = [...candidateData.education];
                                      newEdu[index] = {
                                        ...newEdu[index],
                                        years: e.target.value
                                      };
                                      setCandidateData({ ...candidateData, education: newEdu });
                                    }}
                                    disabled={!editing}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label={`Full Text ${index + 1}`}
                                    value={edu.fullText || ''}
                                    onChange={(e) => {
                                      const newEdu = [...candidateData.education];
                                      newEdu[index] = {
                                        ...newEdu[index],
                                        fullText: e.target.value
                                      };
                                      setCandidateData({ ...candidateData, education: newEdu });
                                    }}
                                    disabled={!editing}
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        ))
                      ) : (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            No education details found. Add education details below.
                          </Typography>
                        </Grid>
                      )}
                      {editing && (
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setCandidateData({
                                ...candidateData,
                                education: [...(Array.isArray(candidateData.education) ? candidateData.education : []), {
                                  degree: '',
                                  institution: '',
                                  years: '',
                                  fullText: ''
                                }]
                              });
                            }}
                          >
                            Add Education
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>

                  {/* Professional Links */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Professional Links</Typography>
                    <Grid container spacing={2}>
                      {/* GitHub Links */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>GitHub</Typography>
                        {candidateData.githubLinks.map((link, index) => (
                          <TextField
                            fullWidth
                            key={index}
                            label={`GitHub ${index + 1}`}
                            value={link}
                            onChange={(e) => {
                              const newLinks = [...candidateData.githubLinks];
                              newLinks[index] = e.target.value;
                              setCandidateData({ ...candidateData, githubLinks: newLinks });
                            }}
                            disabled={!editing}
                          />
                        ))}
                        {editing && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setCandidateData({
                                ...candidateData,
                                githubLinks: [...candidateData.githubLinks, '']
                              });
                            }}
                          >
                            Add GitHub Link
                          </Button>
                        )}
                      </Grid>

                      {/* LinkedIn Links */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>LinkedIn</Typography>
                        {candidateData.linkedinLinks.map((link, index) => (
                          <TextField
                            fullWidth
                            key={index}
                            label={`LinkedIn ${index + 1}`}
                            value={link}
                            onChange={(e) => {
                              const newLinks = [...candidateData.linkedinLinks];
                              newLinks[index] = e.target.value;
                              setCandidateData({ ...candidateData, linkedinLinks: newLinks });
                            }}
                            disabled={!editing}
                          />
                        ))}
                        {editing && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setCandidateData({
                                ...candidateData,
                                linkedinLinks: [...candidateData.linkedinLinks, '']
                              });
                            }}
                          >
                            Add LinkedIn Link
                          </Button>
                        )}
                      </Grid>

                      {/* Other Links */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Other Links</Typography>
                        {candidateData.otherLinks.map((link, index) => (
                          <TextField
                            fullWidth
                            key={index}
                            label={`Other ${index + 1}`}
                            value={link}
                            onChange={(e) => {
                              const newLinks = [...candidateData.otherLinks];
                              newLinks[index] = e.target.value;
                              setCandidateData({ ...candidateData, otherLinks: newLinks });
                            }}
                            disabled={!editing}
                          />
                        ))}
                        {editing && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setCandidateData({
                                ...candidateData,
                                otherLinks: [...candidateData.otherLinks, '']
                              });
                            }}
                          >
                            Add Other Link
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Edit Controls */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      {!editing ? (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => setEditing(true)}
                        >
                          Edit Information
                        </Button>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setEditing(false);
                              // Reset to parsed values
                              setCandidateData({
                                name: parsedData.candidate.parsedName || '',
                                email: parsedData.candidate.email || '',
                                phone: parsedData.candidate.parsedPhone || '',
                                links: parsedData.candidate.parsedLinks || '',
                                status: parsedData.candidate.status || 'NEW'
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            onClick={async () => {
                              try {
                                // Update candidate in backend
                                await api.put(`/recruitment/candidate/${parsedData.candidate.id}`, candidateData);
                                setEditing(false);
                                setError('');
                              } catch (err) {
                                setError('Error saving candidate information. Please try again.');
                                console.error(err);
                              }
                            }}
                          >
                            Save Changes
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* NER Entities */}
            {extractedEntities && extractedEntities.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Named Entity Recognition Results</Typography>
                  {Object.entries(groupEntities(extractedEntities)).map(([type, values]) => (
                    <Box key={type} sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{type}:</Typography>
                      <Box sx={{ ml: 2 }}>
                        {values.map((value, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>- {value}</Typography>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default RecruitmentPage;
