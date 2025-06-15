import React, { useState, useEffect } from 'react';
import { getDetectedAnomalies, getEmployees, getAttritionPrediction } from '../services/api';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    const fetchAnomalies = async () => {
      try {
        const response = await getDetectedAnomalies();
        setAnomalies(response.data);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      }
    };

    fetchEmployees();
    fetchAnomalies();
  }, []);

  const getPrediction = async (employeeId) => {
    if (predictions[employeeId]) return; // Don't fetch if already have it
    try {
      const response = await getAttritionPrediction(employeeId);
      setPredictions(prev => ({ ...prev, [employeeId]: response.data }));
    } catch (error) {
      console.error(`Error fetching prediction for employee ${employeeId}:`, error);
      setPredictions(prev => ({ ...prev, [employeeId]: { riskLevel: 'Error', factors: ['Could not fetch prediction data.'] } }));
    }
  };

  return (
    <div className="analytics-page">
      <h1>Employee Attrition Prediction</h1>
      <div className="employee-list-analytics">
        {employees.map(employee => (
          <div key={employee.id} className="employee-card-analytics">
            <h4>{employee.firstName} {employee.lastName}</h4>
            <p>{employee.position} - {employee.department}</p>
            <button onClick={() => getPrediction(employee.id)}>Predict Attrition Risk</button>
            {predictions[employee.id] && (
              <div className={`prediction-result ${predictions[employee.id].riskLevel?.toLowerCase()}`}>
                <strong>Risk Level: {predictions[employee.id].riskLevel}</strong>
                <ul className="prediction-factors">
                  {predictions[employee.id].factors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="anomaly-detection">
        <h2>Data Anomaly Detection</h2>
        {anomalies.length > 0 ? (
          <ul className="anomaly-list">
            {anomalies.map((anomaly, index) => (
              <li key={index} className="anomaly-item">
                <strong>{anomaly.type}:</strong> {anomaly.employeeName} - {anomaly.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No anomalies detected.</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
