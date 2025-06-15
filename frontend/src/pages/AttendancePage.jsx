import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FiClock, FiLogIn, FiLogOut } from 'react-icons/fi';
import './AttendancePage.css';

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.employeeId) return;

      setLoading(true);
      try {
        const todayRes = await api.get('/attendance/today');
        setTodayRecord(todayRes.data);

        const historyRes = await api.get(`/attendance?employeeId=${user.employeeId}`);
        setRecords(historyRes.data);
        
        setError('');
      } catch (err) {
        setError('Failed to load attendance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  const handleClockIn = async () => {
    try {
      const res = await api.post('/attendance/clockin');
      setTodayRecord(res.data);
      setRecords([res.data, ...records]);
    } catch (err) {
      setError(err.response?.data?.error || 'Clock-in failed.');
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await api.post('/attendance/clockout');
      setTodayRecord(res.data);
      setRecords(records.map(r => r.id === res.data.id ? res.data : r));
    } catch (err) {
      setError(err.response?.data?.error || 'Clock-out failed.');
    }
  };

  const formatDate = (dateStr, formatStr = 'PPP') => dateStr ? format(new Date(dateStr), formatStr) : '-';
  const formatTime = (dateStr) => dateStr ? format(new Date(dateStr), 'p') : '-';

  const canClockIn = !todayRecord;
  const canClockOut = todayRecord && !todayRecord.checkOut;

  return (
    <div className="attendance-page">
      <div className="card attendance-widget">
        <div className="widget-header">
          <h3>Time Clock</h3>
          <div className="live-clock">
            <FiClock /> {format(currentTime, 'PPP p')}
          </div>
        </div>
        <div className="widget-body">
          <div className="status-display">
            <p><strong>Today's Status:</strong> {todayRecord ? `Clocked in at ${formatTime(todayRecord.checkIn)}` : 'Not Clocked In'}</p>
            {todayRecord?.checkOut && <p><strong>Clocked Out:</strong> {formatTime(todayRecord.checkOut)}</p>}
          </div>
          <div className="action-buttons">
            <button onClick={handleClockIn} disabled={!canClockIn} className="btn-primary">
              <FiLogIn /> Clock In
            </button>
            <button onClick={handleClockOut} disabled={!canClockOut} className="btn-secondary">
              <FiLogOut /> Clock Out
            </button>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="card attendance-history">
        <h3>My Attendance History</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="5">No attendance records found.</td></tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id}>
                    <td>{formatDate(rec.date)}</td>
                    <td>{rec.status}</td>
                    <td>{formatTime(rec.checkIn)}</td>
                    <td>{formatTime(rec.checkOut)}</td>
                    <td>{rec.totalHours ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
