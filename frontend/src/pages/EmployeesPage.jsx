import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './EmployeesPage.css';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    hireDate: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (Array.isArray(res.data.employees)) {
        setEmployees(res.data.employees);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await api.post('/employees', formData);
      setFormData({ firstName:'',lastName:'',email:'',department:'',position:'',hireDate:'' });
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to add employee');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="card emp-card">
      <div className="emp-header">
        <h1>Employees</h1>
        <button className="btn-primary add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {showForm && (
        <form className="emp-form" onSubmit={handleSubmit}>
          <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
          <input name="position" placeholder="Position" value={formData.position} onChange={handleChange} required />
          <input name="hireDate" type="date" placeholder="Hire Date" value={formData.hireDate} onChange={handleChange} required />
          <button type="submit" className="btn-primary" style={{gridColumn:'1/-1'}}>Save</button>
          {submitError && <span style={{color:'red',gridColumn:'1/-1'}}>{submitError}</span>}
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="click-row" onClick={() => navigate(`/employees/${emp.id}`)}>
              <td>{emp.firstName} {emp.lastName}</td>
              <td>{emp.email}</td>
              <td>{emp.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeesPage;
