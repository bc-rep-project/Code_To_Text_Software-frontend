import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectService } from '../services/projectService';
import { showNotification, showAsyncNotification } from './common/EnhancedNotificationManager';
import './GoogleDriveUpload.css';

const GoogleDriveUpload = ({ projectId, onUploadComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [oauthUrl, setOauthUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [devCode, setDevCode] = useState(''); // For development testing

  // Step definitions
  const steps = [
    { id: 1, title: 'Initialize', description: 'Starting Google Drive upload process' },
    { id: 2, title: 'Email Verification', description: 'Enter your Gmail address' },
    { id: 3, title: 'Verify Code', description: 'Enter verification code from email' },
    { id: 4, title: 'Google OAuth', description: 'Authorize Google Drive access' },
    { id: 5, title: 'Upload Complete', description: 'Project uploaded successfully' }
  ];

  useEffect(() => {
    initiateUpload();
  }, [projectId]);

  const initiateUpload = async () => {
    setLoading(true);
    try {
      const result = await projectService.googleDriveFlow.initiate(projectId);
      
      if (result.success) {
        if (result.status === 'oauth_required') {
          setCurrentStep(2); // Go to email input
          showNotification(result.instructions || 'Please provide your Gmail address', 'info');
        } else if (result.status === 'already_uploaded') {
          setCurrentStep(5);
          setDriveLink(result.driveLink);
          showNotification('Project already uploaded to Google Drive!', 'success');
        } else if (result.status === 'upload_completed') {
          setCurrentStep(5);
          setDriveLink(result.driveLink);
          showNotification('Upload completed successfully!', 'success');
          if (onUploadComplete) onUploadComplete(result);
        }
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to initialize upload process', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!googleEmail || !googleEmail.endsWith('@gmail.com')) {
      showNotification('Please enter a valid Gmail address', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await showAsyncNotification(
        projectService.googleDriveFlow.submitEmail(projectId, googleEmail),
        {
          loading: 'Sending verification code...',
          success: 'Verification code sent!',
          error: 'Failed to send verification code'
        }
      );

      if (result.success && result.status === 'verification_code_sent') {
        setCurrentStep(3);
        setDevCode(result.verificationCode); // For development
        showNotification(
          result.instructions || 'Check your email for the verification code',
          'info',
          { duration: 8000 }
        );
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Error sending verification code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      showNotification('Please enter a valid 6-digit verification code', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await showAsyncNotification(
        projectService.googleDriveFlow.submitVerificationCode(projectId, googleEmail, verificationCode),
        {
          loading: 'Verifying code...',
          success: 'Email verified successfully!',
          error: 'Verification failed'
        }
      );

      if (result.success && result.status === 'email_verified') {
        setCurrentStep(4);
        setOauthUrl(result.oauthUrl);
        showNotification(
          'Email verified! Please authorize Google Drive access',
          'success',
          { celebration: true }
        );
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Error verifying code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthComplete = async (accessToken, refreshToken = null) => {
    setLoading(true);
    try {
      const result = await showAsyncNotification(
        projectService.googleDriveFlow.submitOAuthTokens(projectId, accessToken, refreshToken),
        {
          loading: 'Uploading to Google Drive...',
          success: 'Upload completed successfully!',
          error: 'Upload failed'
        }
      );

      if (result.success && result.status === 'upload_completed') {
        setCurrentStep(5);
        setDriveLink(result.driveLink);
        showNotification(
          'Project uploaded to Google Drive successfully! 🎉',
          'success',
          { celebration: true, duration: 10000 }
        );
        if (onUploadComplete) onUploadComplete(result);
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Error uploading to Google Drive', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleOAuth = () => {
    if (oauthUrl) {
      // In a real implementation, you would handle the OAuth flow properly
      // For now, we'll simulate it with a popup and manual token entry
      const popup = window.open(
        oauthUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Monitor the popup for completion (in real implementation, this would be handled by OAuth callback)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Simulate OAuth completion with mock tokens for testing
          setTimeout(() => {
            const mockAccessToken = 'ya29.mock_access_token_' + Date.now();
            const mockRefreshToken = '1//04mock_refresh_token_' + Date.now();
            handleOAuthComplete(mockAccessToken, mockRefreshToken);
          }, 1000);
        }
      }, 1000);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="step-content"
          >
            <div className="step-icon">🚀</div>
            <h3>Initializing Upload</h3>
            <p>Setting up Google Drive upload process...</p>
            {loading && <div className="loading-spinner">⏳</div>}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="step-content"
          >
            <div className="step-icon">📧</div>
            <h3>Email Verification</h3>
            <p>Enter your Gmail address to receive a verification code</p>
            
            <form onSubmit={handleEmailSubmit} className="email-form">
              <div className="input-group">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  pattern=".*@gmail\.com$"
                  required
                  disabled={loading}
                  className="email-input"
                />
                <motion.button
                  type="submit"
                  disabled={loading || !googleEmail}
                  className="submit-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? '⏳ Sending...' : '📤 Send Code'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="step-content"
          >
            <div className="step-icon">🔑</div>
            <h3>Enter Verification Code</h3>
            <p>Check your email ({googleEmail}) for the 6-digit code</p>
            
            {devCode && (
              <div className="dev-code-display">
                <small>Development Code: <strong>{devCode}</strong></small>
              </div>
            )}
            
            <form onSubmit={handleVerificationSubmit} className="verification-form">
              <div className="input-group">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength="6"
                  required
                  disabled={loading}
                  className="verification-input"
                />
                <motion.button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="submit-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? '⏳ Verifying...' : '✅ Verify'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="step-content"
          >
            <div className="step-icon">🔐</div>
            <h3>Google OAuth Authorization</h3>
            <p>Click below to authorize Google Drive access</p>
            
            <motion.button
              onClick={openGoogleOAuth}
              disabled={loading}
              className="oauth-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? '⏳ Uploading...' : '🔗 Authorize Google Drive'}
            </motion.button>
            
            <small className="oauth-note">
              You'll be redirected to Google to authorize access
            </small>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="step-content success"
          >
            <motion.div
              className="step-icon success"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1 }}
            >
              🎉
            </motion.div>
            <h3>Upload Complete!</h3>
            <p>Your project has been successfully uploaded to Google Drive</p>
            
            {driveLink && (
              <motion.a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="drive-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📁 Open in Google Drive
              </motion.a>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="google-drive-upload-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>Upload to Google Drive</h2>
          <motion.button
            onClick={onClose}
            className="close-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: currentStep >= step.id ? 1 : 0.5 }}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="step-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="modal-footer">
          <small className="security-note">
            🔒 Your data is secure. We only request minimal permissions for file upload.
          </small>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GoogleDriveUpload; 