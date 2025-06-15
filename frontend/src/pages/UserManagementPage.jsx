import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users', { headers: { 'x-auth-token': token } });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users. You may not have permission to view this page.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, { headers: { 'x-auth-token': token } });
      // Refresh user list to show the updated role
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role.');
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management-page">
      <h1>User Management</h1>
      <div className="users-table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined On</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : 'N/A'}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="HR">HR</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
