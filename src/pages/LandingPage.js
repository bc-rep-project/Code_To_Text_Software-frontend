import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Convert Your Code to Text
              <span className="hero-highlight"> Effortlessly</span>
            </h1>
            <p className="hero-description">
              Transform your codebase into readable text format for documentation, 
              analysis, or sharing. Support for multiple programming languages and 
              intelligent formatting.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="code-preview">
              <div className="code-header">
                <span className="code-dot red"></span>
                <span className="code-dot yellow"></span>
                <span className="code-dot green"></span>
              </div>
              <div className="code-content">
                <div className="code-line">
                  <span className="code-keyword">function</span>
                  <span className="code-function"> convertCode</span>
                  <span className="code-bracket">(</span>
                  <span className="code-param">files</span>
                  <span className="code-bracket">{')'} {'{'}</span>
                </div>
                <div className="code-line">
                  <span className="code-indent">  </span>
                  <span className="code-keyword">return</span>
                  <span className="code-string"> "readable text"</span>
                  <span className="code-semicolon">;</span>
                </div>
                <div className="code-line">
                  <span className="code-bracket">{'}'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2 className="features-title">Why Choose Code2Text?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast Processing</h3>
              <p>Convert your entire codebase in seconds with our optimized processing engine.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Multiple Languages</h3>
              <p>Support for JavaScript, Python, Java, C++, and many more programming languages.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Formatting</h3>
              <p>Intelligent text formatting that preserves code structure and readability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">☁️</div>
              <h3>Cloud Storage</h3>
              <p>Secure cloud storage with easy sharing and collaboration features.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your code is processed securely with enterprise-grade encryption.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy Integration</h3>
              <p>Simple API and web interface for seamless integration into your workflow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of developers who trust Code2Text for their code conversion needs.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Converting Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-icon">🔄</span>
              <span className="brand-text">Code2Text</span>
            </div>
            <div className="footer-links">
              <a href="/privacy" className="footer-link">Privacy</a>
              <a href="/terms" className="footer-link">Terms</a>
              <a href="/support" className="footer-link">Support</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Code2Text. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 