
import { NavLink, Outlet } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import ChatbotWidget from '../components/ChatbotWidget';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaUmbrellaBeach, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaChartBar, 
  FaBrain, 
  FaFileSignature, 
  FaFileAlt, 
  FaClipboardList, 
  FaCogs, 
  FaBullseye, 
  FaUserShield, 
  FaChartPie, 
  FaSignOutAlt,
  FaRobot,
  FaEye 
} from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

import { useState } from 'react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isManagerOrUp = ['ADMIN', 'HR', 'MANAGER'].includes(user?.role);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className={`sidebar ${sidebarOpen?'open':''}`}>
        <div className="sidebar-header">
          <FaBrain className="sidebar-logo-icon" />
          <h2>AI-Enhanced HRMS</h2>
        </div>
        <nav>
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
            <FaUsers className="icon" /> <span>Employees</span>
          </NavLink>
          <NavLink to="/dashboard/attendance" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaCalendarAlt className="icon" /> <span>Attendance</span>
          </NavLink>
          <NavLink to="/dashboard/leave" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaUmbrellaBeach className="icon" /> <span>Leave</span>
          </NavLink>
          <NavLink to="/dashboard/payroll" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaMoneyBillWave className="icon" /> <span>Payroll</span>
          </NavLink>
          <NavLink to="/dashboard/performance" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaChartLine className="icon" /> <span>Performance</span>
          </NavLink>
          <NavLink to="/dashboard/reports" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaChartBar className="icon" /> <span>Reports</span>
          </NavLink>
          <NavLink to="/dashboard/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaBrain className="icon" /> <span>AI Analytics</span>
          </NavLink>
          <NavLink to="/dashboard/recruitment" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaFileSignature className="icon" /> <span>Recruitment</span>
          </NavLink>
          <NavLink to="/dashboard/documents" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaFileAlt className="icon" /> <span>Documents</span>
          </NavLink>
          <NavLink to="/dashboard/onboarding" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaClipboardList className="icon" /> <span>Onboarding</span>
          </NavLink>
          <NavLink to="/dashboard/offboarding" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaSignOutAlt className="icon" /> <span>Offboarding</span>
          </NavLink>
          <NavLink to="/dashboard/leave-policies" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaCogs className="icon" /> <span>Leave Policies</span>
          </NavLink>
          <NavLink to="/dashboard/goals" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaBullseye className="icon" /> <span>Goals</span>
          </NavLink>
          
          {/* AI Features Section */}
          <div className="nav-section-divider">
            <span>AI Features</span>
          </div>
          
          {isManagerOrUp && (
            <>
              <NavLink to="/dashboard/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaChartPie className="icon ai-icon" /> <span>Analytics Dashboard</span>
              </NavLink>
              <NavLink to="/dashboard/anomalies" className={({ isActive }) => isActive ? 'active' : ''}>
                <FiAlertTriangle className="icon ai-icon" /> <span>Anomaly Detection</span>
              </NavLink>
            </>
          )}
          
          {isAdmin && (
            <NavLink to="/dashboard/user-management" className={({ isActive }) => isActive ? 'active' : ''}>
              <FaUserShield className="icon" /> <span>User Management</span>
            </NavLink>
          )}
        </nav>
        <button className="logout" onClick={logout}>
          <FaSignOutAlt className="logout-icon" />
          Logout
        </button>
      </aside>
      <div className="content-column">
          <HeaderBar onMenuClick={()=>setSidebarOpen(!sidebarOpen)} />
          <main className="main-content">
            <Outlet />
          </main>
          <ChatbotWidget />
        </div>
    </div>
  );
};

export default DashboardLayout;
