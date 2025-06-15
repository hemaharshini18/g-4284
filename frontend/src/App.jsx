import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfile from './pages/EmployeeProfile';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import PayrollPage from './pages/PayrollPage';
import PerformancePage from './pages/PerformancePage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecruitmentPage from './pages/RecruitmentPage';
import DocumentsPage from './pages/DocumentsPage';
import OnboardingPage from './pages/OnboardingPage';
import OffboardingPage from './pages/OffboardingPage';
import LeavePoliciesPage from './pages/LeavePoliciesPage';
import GoalManagementPage from './pages/GoalManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import AnomalyDashboardPage from './pages/AnomalyDashboardPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>        <Route index element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="recruitment" element={<RecruitmentPage />} />
        <Route path="documents" element={<DocumentsPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="offboarding" element={<OffboardingPage />} />
              <Route path="leave-policies" element={<LeavePoliciesPage />} />
              <Route path="goals" element={<GoalManagementPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="dashboard/anomalies" element={<AnomalyDashboardPage />} />
              <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
      </Route>
    </Routes>
  );
}

export default App
