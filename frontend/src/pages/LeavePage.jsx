import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FiSend, FiCheck, FiX } from 'react-icons/fi';
import './LeavePage.css';

const LeavePage = () => {
  const { user } = useAuth();
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('my-requests');

  const [form, setForm] = useState({ startDate: '', endDate: '', type: 'SICK', reason: '' });

  const fetchLeaves = async () => {
    if (!user?.employeeId) return;
    setLoading(true);
    try {
      const myLeavesRes = await api.get(`/leave?employeeId=${user.employeeId}`);
      setMyLeaves(myLeavesRes.data);

      if (user.role === 'MANAGER') {
        const teamLeavesRes = await api.get('/leave');
        setTeamLeaves(teamLeavesRes.data.filter(l => l.employeeId !== user.employeeId));
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch leave data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user?.employeeId) {
      setError('User not loaded yet. Please wait and try again.');
      return;
    }
    setError(''); // Clear previous errors
    try {
      await api.post('/leave', { ...form, employeeId: user.employeeId });
      setForm({ startDate: '', endDate: '', type: 'SICK', reason: '' });
      fetchLeaves(); // Refresh the leave list
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit leave request.';
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leave/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      setError('Failed to update leave status.');
    }
  };

  const formatDate = (dateStr) => format(new Date(dateStr), 'do MMM yyyy');

  const LeaveTable = ({ requests, isManagerView }) => (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {isManagerView && <th>Employee</th>}
            <th>Dates</th>
            <th>Type</th>
            <th>Reason</th>
            <th>Status</th>
            {isManagerView && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={isManagerView ? 6 : 5}>Loading...</td></tr>
          ) : requests.length === 0 ? (
            <tr><td colSpan={isManagerView ? 6 : 5}>No requests found.</td></tr>
          ) : (
            requests.map(req => (
              <tr key={req.id}>
                {isManagerView && <td>{`${req.employee.firstName} ${req.employee.lastName}`}</td>}
                <td>{`${formatDate(req.startDate)} - ${formatDate(req.endDate)}`}</td>
                <td>{req.type}</td>
                <td>{req.reason || '-'}</td>
                <td><span className={`status-badge status-${req.status.toLowerCase()}`}>{req.status}</span></td>
                {isManagerView && req.status === 'PENDING' && (
                  <td>
                    <button onClick={() => handleStatusUpdate(req.id, 'APPROVED')} className="btn-icon approve-btn"><FiCheck /></button>
                    <button onClick={() => handleStatusUpdate(req.id, 'REJECTED')} className="btn-icon reject-btn"><FiX /></button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="leave-page">
      <div className="card leave-form-card">
        <h3>Apply for Leave</h3>
        <form onSubmit={handleApply} className="leave-form">
          <div className="form-row">
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
              <option value="SICK">Sick</option>
              <option value="VACATION">Vacation</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>
          <div className="form-row">
            <input type="text" placeholder="Reason for leave (optional)" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="reason-input" />
            <button type="submit" className="btn-primary"><FiSend /> Apply</button>
          </div>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="card leave-history-card">
        {user.role === 'MANAGER' && (
          <div className="tabs">
            <button onClick={() => setActiveTab('my-requests')} className={activeTab === 'my-requests' ? 'active' : ''}>My Requests</button>
            <button onClick={() => setActiveTab('team-requests')} className={activeTab === 'team-requests' ? 'active' : ''}>Team Requests</button>
          </div>
        )}
        <h3>{activeTab === 'my-requests' ? 'My Leave History' : 'Team Leave Requests'}</h3>
        {activeTab === 'my-requests' ? <LeaveTable requests={myLeaves} /> : <LeaveTable requests={teamLeaves} isManagerView />}
      </div>
    </div>
  );
};

export default LeavePage;
