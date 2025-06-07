import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showNotification } from '../common/NotificationManager';
import DarkModeToggle from '../DarkModeToggle';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      showNotification('Error logging out', 'error');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/subscription', label: 'Subscription', icon: '💳' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🔄</span>
          <span className="brand-text">Code2Text</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Profile Dropdown */}
        <div className="navbar-user">
          {/* Dark Mode Toggle */}
          <DarkModeToggle size="small" className="navbar-theme-toggle" />
          
          <button
            className="user-button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="user-avatar">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <span className="user-name">
              {user?.first_name || user?.username}
            </span>
            <span className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`}>
              ▼
            </span>
          </button>

          {isProfileOpen && (
            <div className="user-dropdown">
              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setIsProfileOpen(false)}
              >
                <span>👤</span>
                Profile Settings
              </Link>
              <button
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="mobile-nav-divider"></div>
          <Link
            to="/profile"
            className="mobile-nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            <span>👤</span>
            Profile Settings
          </Link>
          <button
            className="mobile-nav-link logout"
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar; 