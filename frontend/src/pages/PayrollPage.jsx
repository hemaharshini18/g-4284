import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiFilter, FiSave } from 'react-icons/fi';
import './PayrollPage.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const PayrollPage = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ month: '', year: new Date().getFullYear().toString() });
  const [form, setForm] = useState({ employeeId: '', month: '', year: new Date().getFullYear().toString(), basic: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      const res = await api.get('/payroll', { params });
      setPayrolls(res.data);
    } catch (err) {
      setError('Failed to load payroll data.');
      console.error(err);
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data || []);
    } catch (err) {
      setError('Failed to load employees.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayrolls();
      if (user.role === 'MANAGER') {
        fetchEmployees();
      }
    }
  }, [filters, user]);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitPayroll = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        employeeId: parseInt(form.employeeId, 10),
        month: parseInt(form.month, 10),
        year: parseInt(form.year, 10),
        basic: parseFloat(form.basic),
      };
      await api.post('/payroll', payload);
      setForm({ employeeId: '', month: '', year: new Date().getFullYear().toString(), basic: '' });
      setIsFormVisible(false);
      fetchPayrolls(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save payroll.');
      console.error(err);
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page-container payroll-page">
      <div className="page-header">
        <h2>Payroll</h2>
        <p>Manage and view employee payroll records.</p>
      </div>

      <div className="action-bar card">
        <div className="filters">
          <FiFilter className="filter-icon" />
          <select name="month" value={filters.month} onChange={handleFilterChange}>
            <option value="">All Months</option>
            {months.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
          </select>
          <input type="number" name="year" placeholder="Year" value={filters.year} onChange={handleFilterChange} />
        </div>
        {user.role === 'MANAGER' && (
          <button className="btn-primary" onClick={() => setIsFormVisible(!isFormVisible)}>
            {isFormVisible ? 'Cancel' : 'Run Payroll'}
          </button>
        )}
      </div>

      {isFormVisible && user.role === 'MANAGER' && (
        <div className="card payroll-form-card">
          <h3>Run New Payroll</h3>
          <form className="payroll-form" onSubmit={submitPayroll}>
            <div className="form-row">
              <select name="employeeId" value={form.employeeId} onChange={handleFormChange} required>
                <option value="">Select Employee</option>
                {employees && employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}
              </select>
              <select name="month" value={form.month} onChange={handleFormChange} required>
                <option value="">Select Month</option>
                {months.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}
              </select>
              <input type="number" name="year" placeholder="Year" value={form.year} onChange={handleFormChange} required />
            </div>
            <div className="form-row">
              <input type="number" name="basic" placeholder="Basic Salary" value={form.basic} onChange={handleFormChange} step="0.01" required />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary"><FiSave /> Save Payroll</button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-container">
        {error && <p className="error-message">{error}</p>}
      {loading ? <p>Loading payroll data...</p> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Pay Period</th>
                  <th className="text-right">Basic</th>
                  <th className="text-right">Allowances</th>
                  <th className="text-right">Deductions</th>
                  <th className="text-right">Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="employee-cell">
                        {p.employee.firstName} {p.employee.lastName}
                        <span>{p.employee.position}</span>
                      </div>
                    </td>
                    <td>{months[p.month - 1]} {p.year}</td>
                    <td className="text-right">₹{p.basic.toFixed(2)}</td>
                    <td className="text-right">₹{p.allowances.toFixed(2)}</td>
                    <td className="text-right">₹{p.deductions.toFixed(2)}</td>
                    <td className="text-right net-salary">₹{p.net.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;
