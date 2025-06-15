import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamOverview } from '../../services/api';
import '../../pages/AnalyticsDashboardPage.css'; // Reuse styles

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getTeamOverview();
        setOverview(res.data);
      } catch (err) {
        setError('Failed to fetch team overview. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) return <div className="loading">Loading Team Overview...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-dashboard-refreshed">
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <p>Welcome! Here is an overview of your team's performance and status.</p>
      </div>

      {/* Summary Cards for Manager */}
      <div className="summary-cards-refreshed">
        <div className="card-refreshed">
          <div className="card-icon employees"></div>
          <div className="card-content">
            <h4>Team Size</h4>
            <span>{overview?.teamSize}</span>
          </div>
        </div>
        <div className="card-refreshed">
          <div className="card-icon goals-manager"></div>
          <div className="card-content">
            <h4>Goals In Progress</h4>
            <span>{overview?.teamData.reduce((acc, member) => acc + member.goalsInProgress, 0)}</span>
          </div>
        </div>
        <div className="card-refreshed">
          <div className="card-icon leave-manager"></div>
          <div className="card-content">
            <h4>Pending Leave Requests</h4>
            <span>{overview?.teamData.reduce((acc, member) => acc + member.pendingLeaveRequests, 0)}</span>
          </div>
        </div>
      </div>

      {/* Team Member Table */}
      <div className="table-container-refreshed">
        <h3>Team Members</h3>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Job Title</th>
              <th>Goals In Progress</th>
              <th>Goals At Risk</th>
              <th>Pending Leave</th>
            </tr>
          </thead>
          <tbody>
            {overview?.teamData.map(member => (
              <tr key={member.id} onClick={() => navigate(`/employees/${member.id}`)} style={{ cursor: 'pointer' }}>
                <td>{member.name}</td>
                <td>{member.jobTitle}</td>
                <td>{member.goalsInProgress}</td>
                <td>{member.goalsAtRisk}</td>
                <td>{member.pendingLeaveRequests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerDashboard;
