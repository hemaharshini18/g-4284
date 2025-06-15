import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './DocumentsPage.css';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('document', selectedFile);

    setIsLoading(true);
    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchDocuments(); // Refresh the list
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading document:', error);
    }
    setIsLoading(false);
  };

  // Use API service to download document
  const handleDownload = async (docId) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
      
      // Check if the response is actually a blob
      if (response.data instanceof Blob) {
        // Create blob from response data
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `document-${docId}`);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        link.remove();
      } else {
        // If response is not a blob, it might be an error message
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            console.error('Server error:', errorData);
            alert(errorData.msg || 'Failed to download document');
          } catch (e) {
            console.error('Error parsing server response:', e);
            alert('Failed to download document');
          }
        };
        reader.readAsText(response.data);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      if (error.response) {
        if (error.response.status === 401) {
          alert('Please log in to download documents');
        } else if (error.response.status === 404) {
          alert('Document not found');
        } else {
          alert(error.response.data?.msg || 'Failed to download document');
        }
      } else {
        alert('Failed to download document');
      }
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocuments(); // Refresh the list
    } catch (error) {
      alert('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  return (
    <div className="documents-page">
      <h1>Document Management</h1>

      <div className="document-uploader">
        <h3>Upload New Document</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={isLoading || !selectedFile}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div className="document-list">
        <h2>Uploaded Documents</h2>
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size (KB)</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>{doc.filename}</td>
                <td>{(doc.size / 1024).toFixed(2)}</td>
                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDownload(doc.id)}>Download</button>
                  <button onClick={() => handleDelete(doc.id)} style={{ marginLeft: '8px', backgroundColor: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsPage;
