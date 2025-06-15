import React, { useState, useEffect } from 'react';
import { getOffboardingEmployees, updateOffboardingTaskStatus } from '../services/api';
import './OnboardingPage.css'; // Reuse styles for consistency

const OffboardingPage = () => {
  const [offboardingEmployees, setOffboardingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOffboardingEmployees = async () => {
    try {
      const res = await getOffboardingEmployees();
      setOffboardingEmployees(res.data);
    } catch (err) {
      setError('Failed to fetch offboarding employees. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffboardingEmployees();
  }, []);

  const handleTaskToggle = async (taskId, currentStatus) => {
    try {
      await updateOffboardingTaskStatus(taskId, { completed: !currentStatus });
      fetchOffboardingEmployees(); // Refresh list
    } catch (err) {
      setError('Failed to update task status.');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="onboarding-page"> {/* Reuse class for styling */}
      <div className="header">
        <h1>Employee Offboarding Tracker</h1>
        <p>Monitor the progress of departing employees as they complete their offboarding tasks.</p>
      </div>

      {offboardingEmployees.length === 0 ? (
        <div className="no-data-message">No employees are currently offboarding.</div>
      ) : (
        <div className="onboarding-list">
          {offboardingEmployees.map(employee => (
            <div key={employee.id} className="employee-card">
              <div className="employee-info">
                <h2>{employee.firstName} {employee.lastName}</h2>
                <p>{employee.jobTitle} - {employee.department}</p>
                <p>Status: {employee.status}</p>
              </div>
              <div className="task-list">
                <h3>Offboarding Checklist</h3>
                <ul>
                  {employee.offboardingTasks.map(task => (
                    <li key={task.id} className={task.completed ? 'completed' : ''}>
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id, task.completed)}
                        id={`task-${task.id}`}
                      />
                      <label htmlFor={`task-${task.id}`}>{task.taskName}</label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffboardingPage;
