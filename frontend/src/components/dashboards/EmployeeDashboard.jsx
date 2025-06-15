import React, { useState, useEffect } from 'react';
import { getEmployeeDashboard } from '../../services/api';
import '../../pages/AnalyticsDashboardPage.css'; // Reuse styles

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEmployeeDashboard();
        setDashboardData(res.data);
      } catch (err) {
        setError('Failed to fetch your dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading Your Dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-dashboard-refreshed">
      <div className="dashboard-header">
        <h1>Your Dashboard</h1>
        <p>Welcome! Here is your personal overview and recent activity.</p>
      </div>

      {/* Employee Summary Cards */}
      <div className="summary-cards-refreshed">
        <div className="card-refreshed">
          <div className="card-icon goals"></div>
          <div className="card-content">
            <h4>Upcoming Goals</h4>
            <span>{dashboardData?.upcomingGoals.length || 0}</span>
          </div>
        </div>
        {dashboardData?.leaveBalances.map(lb => (
          <div className="card-refreshed" key={lb.policyName}>
            <div className="card-icon leave"></div>
            <div className="card-content">
              <h4>{lb.policyName} Balance</h4>
              <span>{lb.balance} days</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="table-container-refreshed">
        <h3>Recent Attendance</h3>
        <ul className="modern-list">
          {dashboardData?.recentAttendance.map(att => (
            <li key={att.id}>
              <span>{new Date(att.date).toLocaleDateString()}</span>
              <span className={`status-badge ${att.status.toLowerCase()}`}>{att.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
