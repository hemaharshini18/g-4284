import { NavLink, Outlet } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import ChatbotWidget from '../components/ChatbotWidget';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';
import { FaUsers, FaCalendarAlt, FaUmbrellaBeach, FaMoneyBillWave, FaChartLine, FaChartBar, FaMagic, FaFileSignature, FaFileAlt, FaClipboardList, FaCogs, FaBullseye, FaUserShield, FaChartPie, FaSignOutAlt } from 'react-icons/fa';
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
        <h2>HRMS</h2>
        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}><FaUsers /> <span>Employees</span></NavLink>
          <NavLink to="/attendance" className={({ isActive }) => isActive ? 'active' : ''}><FaCalendarAlt /> <span>Attendance</span></NavLink>
          <NavLink to="/leave" className={({ isActive }) => isActive ? 'active' : ''}><FaUmbrellaBeach /> <span>Leave</span></NavLink>
          <NavLink to="/payroll" className={({ isActive }) => isActive ? 'active' : ''}><FaMoneyBillWave /> <span>Payroll</span></NavLink>
          <NavLink to="/performance" className={({ isActive }) => isActive ? 'active' : ''}><FaChartLine /> <span>Performance</span></NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}><FaChartBar /> <span>Reports</span></NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}><FaMagic /> <span>Analytics</span></NavLink>
          <NavLink to="/recruitment" className={({ isActive }) => isActive ? 'active' : ''}><FaFileSignature /> <span>Recruitment</span></NavLink>
          <NavLink to="/documents" className={({ isActive }) => isActive ? 'active' : ''}><FaFileAlt /> <span>Documents</span></NavLink>
          <NavLink to="/onboarding" className={({ isActive }) => isActive ? 'active' : ''}><FaClipboardList /> <span>Onboarding</span></NavLink>
          <NavLink to="/offboarding" className={({ isActive }) => isActive ? 'active' : ''}><FaSignOutAlt /> <span>Offboarding</span></NavLink>
          <NavLink to="/leave-policies" className={({ isActive }) => isActive ? 'active' : ''}><FaCogs /> <span>Leave Policies</span></NavLink>
          <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}><FaBullseye /> <span>Goals</span></NavLink>
          {isAdmin && (
            <NavLink to="/user-management" className={({ isActive }) => isActive ? 'active' : ''}><FaUserShield /> <span>User Management</span></NavLink>
          )}
          {isManagerOrUp && (
            <>
              <NavLink to="/dashboard/analytics" className={({ isActive }) => isActive ? 'active' : ''}><FaChartPie /> <span>Analytics</span></NavLink>
              <NavLink to="/dashboard/anomalies" className={({ isActive }) => isActive ? 'active' : ''}><FiAlertTriangle /> <span>Anomalies</span></NavLink>
            </>
          )}
        </nav>
        <button className="logout" onClick={logout}>
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
