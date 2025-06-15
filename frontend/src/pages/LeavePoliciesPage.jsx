import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeavePoliciesPage.css';

const LeavePoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(null); // Stores the id of the policy being edited
  const [formData, setFormData] = useState({ name: '', defaultAllowance: '' });

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/leave-policies', { headers: { 'x-auth-token': token } });
      setPolicies(res.data);
    } catch (err) {
      setError('Failed to fetch leave policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        // Update existing policy
        await axios.put(`/api/leave-policies/${isEditing}`, formData, { headers: { 'x-auth-token': token } });
      } else {
        // Create new policy
        await axios.post('/api/leave-policies', formData, { headers: { 'x-auth-token': token } });
      }
      setFormData({ name: '', defaultAllowance: '' });
      setIsEditing(null);
      fetchPolicies(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save policy.');
    }
  };

  const handleEdit = (policy) => {
    setIsEditing(policy.id);
    setFormData({ name: policy.name, defaultAllowance: policy.defaultAllowance });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/leave-policies/${id}`, { headers: { 'x-auth-token': token } });
            fetchPolicies(); // Refresh the list
        } catch (err) {
            setError('Failed to delete policy.');
        }
    }
  };

  const cancelEdit = () => {
      setIsEditing(null);
      setFormData({ name: '', defaultAllowance: '' });
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="leave-policies-page">
      <h1>Manage Leave Policies</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-container">
        <h2>{isEditing ? 'Edit Policy' : 'Create New Policy'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Policy Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Annual Leave"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="defaultAllowance">Annual Allowance (Days)</label>
            <input
              type="number"
              id="defaultAllowance"
              name="defaultAllowance"
              value={formData.defaultAllowance}
              onChange={handleInputChange}
              placeholder="e.g., 20"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{isEditing ? 'Update Policy' : 'Create Policy'}</button>
            {isEditing && <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="policies-list">
        <h2>Existing Policies</h2>
        <table>
          <thead>
            <tr>
              <th>Policy Name</th>
              <th>Annual Allowance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(policy => (
              <tr key={policy.id}>
                <td>{policy.name}</td>
                <td>{policy.defaultAllowance} days</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(policy)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(policy.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeavePoliciesPage;
