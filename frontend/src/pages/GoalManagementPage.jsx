import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './GoalManagementPage.css';

const GoalManagementPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the new goal form
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');

  useEffect(() => {
    if (user?.employee?.id) {
      fetchGoals(user.employee.id);
    }
  }, [user]);

  const fetchGoals = async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/goals/employee/${employeeId}`, { headers: { 'x-auth-token': token } });
      setGoals(res.data);
    } catch (err) {
      setError('Failed to fetch goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/goals', 
        { title: newGoalTitle, description: newGoalDescription, employeeId: user.employee.id }, 
        { headers: { 'x-auth-token': token } }
      );
      setNewGoalTitle('');
      setNewGoalDescription('');
      fetchGoals(user.employee.id);
    } catch (err) {
      setError('Failed to create goal.');
    }
  };

  const handleUpdateKeyResult = async (keyResultId, newProgress) => {
      try {
          const token = localStorage.getItem('token');
          await axios.put(`/api/goals/key-results/${keyResultId}`, 
            { progress: newProgress }, 
            { headers: { 'x-auth-token': token } }
          );
          fetchGoals(user.employee.id);
      } catch (err) {
          setError('Failed to update key result.');
      }
  };

  if (loading) return <div>Loading goals...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="goal-management-page">
      <h1>My Goals (OKRs)</h1>
      
      <div className="create-goal-form">
        <h2>Create a New Goal</h2>
        <form onSubmit={handleCreateGoal}>
          <input 
            type="text" 
            value={newGoalTitle} 
            onChange={(e) => setNewGoalTitle(e.target.value)} 
            placeholder="Goal Title (e.g., Increase Customer Satisfaction)" 
            required 
          />
          <textarea 
            value={newGoalDescription} 
            onChange={(e) => setNewGoalDescription(e.target.value)} 
            placeholder="Goal Description" 
          />
          <button type="submit">Create Goal</button>
        </form>
      </div>

      <div className="goals-list">
        {goals.map(goal => (
          <div key={goal.id} className="goal-card">
            <div className="goal-header">
              <h3>{goal.title}</h3>
              <span className={`status-badge status-${goal.status.toLowerCase()}`}>{goal.status.replace('_', ' ')}</span>
            </div>
            <p className="goal-description">{goal.description}</p>
            
            <div className="key-results-list">
              <h4>Key Results</h4>
              {goal.keyResults.length > 0 ? (
                goal.keyResults.map(kr => (
                  <div key={kr.id} className="key-result">
                    <p>{kr.title}</p>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${kr.progress}%` }}></div>
                    </div>
                    <span>{kr.progress}%</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={kr.progress} 
                        onChange={(e) => handleUpdateKeyResult(kr.id, e.target.value)} 
                    />
                  </div>
                ))
              ) : (
                <p>No key results defined yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalManagementPage;
