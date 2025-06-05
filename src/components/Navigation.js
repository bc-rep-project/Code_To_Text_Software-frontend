import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { useTheme } from '../contexts/ThemeContext';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav 
      className="navigation"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="nav-container">
        {/* Logo/Brand */}
        <motion.div 
          className="nav-brand"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
        >
          <motion.span 
            className="brand-icon"
            animate={{ 
              rotate: isDarkMode ? 360 : 0,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 0.5 },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            💻
          </motion.span>
          <span className="brand-text">Code to Text</span>
        </motion.div>

        {/* Navigation Links */}
        <div className="nav-links">
          {navItems.map((item, index) => (
            <motion.button
              key={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {isActive(item.path) && (
                <motion.div
                  className="nav-indicator"
                  layoutId="navIndicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Right side controls */}
        <div className="nav-controls">
          {/* Dark Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <DarkModeToggle size="medium" />
          </motion.div>

          {/* User Menu - Optional */}
          <motion.div 
            className="user-menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.button 
              className="user-avatar"
              animate={{ 
                boxShadow: isDarkMode 
                  ? '0 0 20px rgba(99, 179, 237, 0.3)' 
                  : '0 0 20px rgba(66, 133, 244, 0.3)'
              }}
              transition={{ duration: 0.3 }}
            >
              👤
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Background gradient animation */}
      <motion.div 
        className="nav-background"
        animate={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(74, 85, 104, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)'
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.nav>
  );
};

export default Navigation; 