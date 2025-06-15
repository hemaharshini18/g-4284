import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Use the centralized api service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // The api service already has the interceptor to add the token
          const res = await api.get('/auth/me');
          setUser(res.data);
          setError(null);
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token'); // Invalid token
          setError('Authentication failed. Please try logging in again.');
        }
      } else {
        setError(null);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      // After setting token, the api instance will use it for the next request
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      setError(null);
      navigate('/');
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Login failed. Please try again.');
      throw err.response ? err.response.data.error : err.message;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {loading ? (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2>Loading...</h2>
            {error && (
              <p style={{ color: 'red' }}>{error}</p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
