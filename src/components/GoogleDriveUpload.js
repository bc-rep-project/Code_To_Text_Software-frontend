import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import projectService from '../services/projectService';
import { showNotification } from './common/EnhancedNotificationManager';
import './GoogleDriveUpload.css';

const GoogleDriveUpload = ({ projectId, onUploadComplete, onClose }) => {
  const [uploadStep, setUploadStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [authUrl, setAuthUrl] = useState('');

  const steps = [
    { id: 1, title: 'Initialize', description: 'Checking authentication status' },
    { id: 2, title: 'Google OAuth', description: 'Authenticate with Google Drive' },
    { id: 3, title: 'Upload', description: 'Uploading files to Google Drive' },
    { id: 4, title: 'Complete', description: 'Upload completed successfully' }
  ];

  useEffect(() => {
    initializeUpload();
  }, [projectId]);

  const initializeUpload = async () => {
    setLoading(true);
    try {
      const result = await projectService.uploadToGoogleDrive(projectId);
      
      if (result.success) {
        if (result.actionRequired === 'GOOGLE_OAUTH_REQUIRED') {
          // User needs to authenticate with Google
          setAuthUrl(result.authUrl);
          setUploadStep(2);
          showNotification('Google authentication required', 'info');
        } else if (result.driveLink) {
          // Already uploaded
          setDriveLink(result.driveLink);
          setUploadStep(4);
          setUploadComplete(true);
          showNotification('Project already uploaded to Google Drive!', 'success');
        }
      } else {
        showNotification(result.message || 'Failed to initialize upload', 'error');
      }
    } catch (error) {
      console.error('Upload initialization failed:', error);
      showNotification('Failed to initialize Google Drive upload', 'error');
    }
    setLoading(false);
  };

  const handleGoogleAuth = () => {
    if (authUrl) {
      // Open Google OAuth in new window
      const authWindow = window.open(authUrl, 'google-oauth', 'width=500,height=600');
      
      // Poll for auth completion
      const pollTimer = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(pollTimer);
            // Check if auth was successful by retrying upload
            checkAuthStatus();
          }
        } catch (e) {
          // Cross-origin errors are expected
        }
      }, 1000);
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    setUploadStep(3);
    
    try {
      const result = await projectService.uploadToGoogleDrive(projectId);
      
      if (result.success && result.driveLink) {
        setDriveLink(result.driveLink);
        setUploadStep(4);
        setUploadComplete(true);
        showNotification('Project uploaded to Google Drive successfully! 🎉', 'success');
        
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else if (result.actionRequired === 'GOOGLE_OAUTH_REQUIRED') {
        // Still need auth
        setUploadStep(2);
        showNotification('Google authentication is still required', 'warning');
      } else {
        showNotification(result.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showNotification('Failed to complete upload', 'error');
    }
    setLoading(false);
  };

  const handleOpenDriveLink = () => {
    if (driveLink) {
      window.open(driveLink, '_blank');
    }
  };

  return (
    <motion.div
      className="google-drive-upload-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload to Google Drive</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="steps-container">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`step ${uploadStep >= step.id ? 'active' : ''} ${uploadStep === step.id ? 'current' : ''}`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="step-details">
          {uploadStep === 1 && (
            <div className="step-info">
              <p>Checking your authentication status...</p>
              {loading && <div className="spinner"></div>}
            </div>
          )}

          {uploadStep === 2 && (
            <div className="step-info">
              <p>Click below to authenticate with Google Drive</p>
              <button 
                className="auth-button"
                onClick={handleGoogleAuth}
                disabled={loading || !authUrl}
              >
                {loading ? '⏳ Processing...' : '🔗 Authenticate with Google'}
              </button>
              <p className="help-text">
                This will open a new window for Google authentication.
                Close it after completing the login process.
              </p>
            </div>
          )}

          {uploadStep === 3 && (
            <div className="step-info">
              <p>Uploading your project to Google Drive...</p>
              <div className="spinner"></div>
            </div>
          )}

          {uploadStep === 4 && uploadComplete && (
            <div className="step-info success">
              <p>Your project has been successfully uploaded to Google Drive</p>
              {driveLink && (
                <button 
                  className="drive-link-button"
                  onClick={handleOpenDriveLink}
                >
                  📁 Open in Google Drive
                </button>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            {uploadComplete ? 'Close' : 'Cancel'}
          </button>
          {uploadStep === 2 && !loading && (
            <button className="retry-button" onClick={initializeUpload}>
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GoogleDriveUpload; 