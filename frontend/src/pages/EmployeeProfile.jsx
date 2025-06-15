import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EmployeeProfile.css';

const EmployeeProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`/api/employees/${id}`);
        setEmployee(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load employee');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!employee) return null;

  return (
    <div className="profile-wrapper">
      <div className="profile-card card">
        <div className="profile-header">
          <div className="avatar-placeholder">{employee.firstName[0]}</div>
          <div>
            <h2>{employee.firstName} {employee.lastName}</h2>
            <p className="muted">{employee.position || '—'} • {employee.department}</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="timeline card-small">
            <h3>Timeline</h3>
            <ul>
              <li><span className="time">2025-01-05</span> Joined the organisation</li>
              <li><span className="time">2025-03-12</span> Completed onboarding</li>
              <li><span className="time">2025-05-30</span> Received spot award</li>
            </ul>
          </div>
          <div className="praise card-small">
            <h3>Praise</h3>
            <div className="praise-grid">
              <div className="badge">🌟<small>3</small></div>
              <div className="badge">🤝<small>2</small></div>
              <div className="badge">🚀<small>1</small></div>
              <div className="badge">💡<small>4</small></div>
            </div>
          </div>
          <div className="goals card-small" style={{gridColumn:'1 / -1'}}>
            <h3>Goals Progress</h3>
            <div className="goal-item">
              <span>Q2 OKRs</span>
              <progress value="60" max="100"></progress>
              <span className="goal-val">60%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
