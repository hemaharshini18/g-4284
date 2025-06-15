import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import './AnalyticsDashboardPage.css';

const AnalyticsDashboardPage = () => {
  const { user, loading } = useAuth();

  const renderDashboardByRole = () => {
    if (loading) {
      return <div className="loading">Loading user data...</div>;
    }

    switch (user?.role) {
      case 'ADMIN':
      case 'HR':
        return <AdminDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      default:
        return <div className="error-message">You do not have permission to view this dashboard.</div>;
    }
  };

  return (
    <div className="analytics-dashboard-container">
      {renderDashboardByRole()}
    </div>
  );
};

export default AnalyticsDashboardPage;
