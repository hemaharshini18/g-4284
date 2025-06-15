import React, { useState, useEffect } from 'react';
import { getDetectedAnomalies } from '../services/api';
import { FiAlertTriangle, FiInfo, FiTrendingDown } from 'react-icons/fi';
import './AnomalyDashboard.css';

const AnomalyCard = ({ anomaly }) => {
  const getSeverityDetails = (severity) => {
    switch (severity) {
      case 'High':
      case 'Critical':
        return { icon: <FiAlertTriangle className="icon high" />, class: 'high' };
      case 'Medium':
      case 'Warning':
        return { icon: <FiTrendingDown className="icon medium" />, class: 'medium' };
      case 'Low':
      default:
        return { icon: <FiInfo className="icon low" />, class: 'low' };
    }
  };

  const { icon, class: severityClass } = getSeverityDetails(anomaly.severity);

  return (
    <div className={`anomaly-card ${severityClass}`}>
      <div className="card-header">
        {icon}
        <h3 className="card-title">{anomaly.type}</h3>
        <span className="card-severity">{anomaly.severity}</span>
      </div>
      <div className="card-body">
        <p className="card-description">{anomaly.description}</p>
        {anomaly.employeeName && (
            <p className="card-employee"><strong>Employee:</strong> {anomaly.employeeName}</p>
        )}
        <p className="card-recommendation"><strong>Recommendation:</strong> {anomaly.recommendation}</p>
      </div>
      <div className="card-footer">
        <p className="card-date">Detected: {new Date(anomaly.date).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const AnomalyDashboardPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        const response = await getDetectedAnomalies();
        setAnomalies(response.data);
      } catch (err) {
        console.error('Failed to fetch anomalies:', err);
        setError('Failed to load anomaly data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  return (
    <div className="anomaly-dashboard-container">
      <h1 className="dashboard-title">AI-Powered Anomaly Dashboard</h1>
      <p className="dashboard-subtitle">Real-time insights into workforce patterns and potential issues.</p>

      {loading && <p className="loading-text">Analyzing data, please wait...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && anomalies.length === 0 && (
        <div className="no-anomalies-found">
          <h2>All Clear!</h2>
          <p>No significant anomalies were detected in the latest analysis. The system is running smoothly.</p>
        </div>
      )}

      <div className="anomalies-grid">
        {anomalies.map((anomaly) => (
          <AnomalyCard key={anomaly.id} anomaly={anomaly} />
        ))}
      </div>
    </div>
  );
};

export default AnomalyDashboardPage;
