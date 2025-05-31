import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-icon">🔄</span>
            <span className="brand-text">Code2Text</span>
          </div>
          <div className="footer-links">
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/terms" className="footer-link">Terms of Service</a>
            <a href="/support" className="footer-link">Support</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Code2Text. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 