import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showNotification } from '../../components/common/NotificationManager';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username_or_email || !formData.password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        showNotification(result.message || 'Login successful!', 'success');
        navigate('/dashboard');
      } else {
        showNotification(result.message || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Code2Text account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username_or_email">Email or Username</label>
            <input
              type="text"
              id="username_or_email"
              name="username_or_email"
              value={formData.username_or_email}
              onChange={handleChange}
              placeholder="Enter your email or username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" message="" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-auth">
          <GoogleAuthButton 
            text="Continue with Google"
            onSuccess={handleGoogleSuccess}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Login; 