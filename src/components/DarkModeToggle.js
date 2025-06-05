import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import './DarkModeToggle.css';

const DarkModeToggle = ({ className = '', size = 'medium' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleVariants = {
    light: {
      backgroundColor: '#e2e8f0',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    dark: {
      backgroundColor: '#4a5568',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const circleVariants = {
    light: {
      x: 2,
      backgroundColor: '#fbbf24',
      rotate: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    dark: {
      x: 26,
      backgroundColor: '#f3f4f6',
      rotate: 180,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const iconVariants = {
    visible: { scale: 1, opacity: 1 },
    hidden: { scale: 0.3, opacity: 0 }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'dark-mode-toggle-small';
      case 'large': return 'dark-mode-toggle-large';
      default: return 'dark-mode-toggle-medium';
    }
  };

  return (
    <motion.button
      className={`dark-mode-toggle ${getSizeClass()} ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="toggle-track"
        variants={toggleVariants}
        animate={isDarkMode ? 'dark' : 'light'}
      >
        <motion.div
          className="toggle-circle"
          variants={circleVariants}
          animate={isDarkMode ? 'dark' : 'light'}
        >
          {/* Sun Icon */}
          <motion.div
            className="toggle-icon sun-icon"
            variants={iconVariants}
            animate={isDarkMode ? 'hidden' : 'visible'}
            transition={{ duration: 0.2 }}
          >
            ☀️
          </motion.div>
          
          {/* Moon Icon */}
          <motion.div
            className="toggle-icon moon-icon"
            variants={iconVariants}
            animate={isDarkMode ? 'visible' : 'hidden'}
            transition={{ duration: 0.2 }}
          >
            🌙
          </motion.div>
        </motion.div>
        
        {/* Background Stars for Dark Mode */}
        {isDarkMode && (
          <motion.div
            className="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="star star-1">⭐</span>
            <span className="star star-2">✨</span>
            <span className="star star-3">💫</span>
          </motion.div>
        )}
      </motion.div>
      
      {/* Optional label for larger sizes */}
      {size === 'large' && (
        <motion.span 
          className="toggle-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </motion.span>
      )}
    </motion.button>
  );
};

export default DarkModeToggle; 