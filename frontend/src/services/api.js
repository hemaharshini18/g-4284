import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  responseType: 'json',
});

// Add a request interceptor to include the token and handle file downloads
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // For file downloads, set responseType to blob
    if (config.url?.includes('/download')) {
      config.responseType = 'blob';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const sendChatMessage = (data) => api.post('/chatbot/message', data);

export const downloadAttendanceReport = () => {
  return api.get('/reports/attendance', { responseType: 'blob' });
};

export const downloadPayrollReport = () => {
  return api.get('/reports/payroll', { responseType: 'blob' });
};

export const downloadLeaveReport = () => {
  return api.get('/reports/leave', { responseType: 'blob' });
};

export const getOnboardingEmployees = () => api.get('/onboarding');
export const updateOnboardingTask = (taskId, data) => api.put(`/onboarding/tasks/${taskId}`, data);

// Offboarding
export const getOffboardingEmployees = () => api.get('/offboarding');
export const updateOffboardingTaskStatus = (taskId, data) => api.put(`/offboarding/tasks/${taskId}`, data);

// Analytics
export const getAnalyticsSummary = () => api.get('/analytics/summary');
export const getGoalPerformance = () => api.get('/analytics/goal-performance');
export const getLeaveTrends = () => api.get('/analytics/leave-trends');

// Manager-specific endpoints
export const getTeamOverview = () => api.get('/manager/team-overview');

// Employee-specific endpoints
export const getEmployeeDashboard = () => api.get('/employee/dashboard');
export const getDetectedAnomalies = () => api.get('/analytics/anomalies');

// Employees
export const getEmployees = () => api.get('/employees');
export const getAttritionPrediction = (employeeId) => api.get(`/analytics/attrition-prediction/${employeeId}`);
export const generateReportSummary = () => api.post('/analytics/generate-summary');
export const generatePerformanceFeedback = (data) => api.post('/analytics/generate-feedback', data);

export default api;
