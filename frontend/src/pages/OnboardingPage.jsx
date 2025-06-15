import React, { useState, useEffect } from 'react';
import { getOnboardingEmployees, updateOnboardingTask } from '../services/api';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const [onboardingEmployees, setOnboardingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOnboardingEmployees = async () => {
    try {
      const res = await getOnboardingEmployees();
      setOnboardingEmployees(res.data);
    } catch (err) {
      setError('Failed to fetch onboarding employees. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingEmployees();
  }, []);

  const handleTaskToggle = async (taskId, currentStatus) => {
    try {
        await updateOnboardingTask(taskId, { completed: !currentStatus });
        // Refresh the list to show the updated status
        fetchOnboardingEmployees(); 
    } catch (err) {
        setError('Failed to update task status.');
        console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="onboarding-page">
      <div className="header">
        <h1>Employee Onboarding Tracker</h1>
        <p>Monitor the progress of new hires as they complete their onboarding tasks.</p>
      </div>

      {onboardingEmployees.length === 0 ? (
        <div className="no-data-message">No employees are currently onboarding.</div>
      ) : (
        <div className="onboarding-list">
          {onboardingEmployees.map(employee => (
            <div key={employee.id} className="employee-card">
              <div className="employee-info">
                <h2>{employee.firstName} {employee.lastName}</h2>
                <p>{employee.jobTitle} - {employee.department}</p>
                <p>Hired on: {new Date(employee.hireDate).toLocaleDateString()}</p>
              </div>
              <div className="task-list">
                <h3>Onboarding Checklist</h3>
                <ul>
                  {employee.onboardingTasks.map(task => (
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

export default OnboardingPage;
