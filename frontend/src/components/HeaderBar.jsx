import './HeaderBar.css';
import { useAuth } from '../context/AuthContext';

const HeaderBar = ({ onMenuClick }) => {
  const { logout } = useAuth();

  return (
    <header className="header-bar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Menu">☰</button>
      <div className="logo">HRMS</div>
      <div className="spacer" />
      <button className="avatar" onClick={logout} title="Logout">
        <span>Logout</span>
      </button>
    </header>
  );
};

export default HeaderBar;
