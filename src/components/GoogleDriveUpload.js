import React, { useState, useEffect, useCallback } from 'react';
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
  const [authWindow, setAuthWindow] = useState(null);
  const [pollTimer, setPollTimer] = useState(null);

  const steps = [
    { id: 1, title: 'Initialize', description: 'Checking authentication status' },
    { id: 2, title: 'Google OAuth', description: 'Authenticate with Google Drive' },
    { id: 3, title: 'Upload', description: 'Uploading files to Google Drive' },
    { id: 4, title: 'Complete', description: 'Upload completed successfully' }
  ];

  // Cleanup function to prevent memory leaks
  const cleanup = useCallback(() => {
    if (pollTimer) {
      clearInterval(pollTimer);
      setPollTimer(null);
    }
    if (authWindow && !authWindow.closed) {
      authWindow.close();
      setAuthWindow(null);
    }
  }, [pollTimer, authWindow]);

  useEffect(() => {
    initializeUpload();
    
    // Cleanup on unmount
    return cleanup;
  }, [projectId, cleanup]);

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
    if (!authUrl) {
      showNotification('Authentication URL not available. Please try again.', 'error');
      return;
    }

    // Close any existing popup first
    cleanup();

    try {
      // Open Google OAuth in new window with specific features
      const popup = window.open(
        authUrl, 
        'google-oauth', 
        'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes'
      );

      if (!popup) {
        showNotification('Popup blocked. Please allow popups for this site and try again.', 'error');
        return;
      }

      setAuthWindow(popup);
      
      // Monitor popup status with improved polling
      const timer = setInterval(() => {
        try {
          // Check if popup is closed
          if (popup.closed) {
            clearInterval(timer);
            setPollTimer(null);
            setAuthWindow(null);
            
            // Wait a moment for auth to process, then check status
            setTimeout(() => {
              checkAuthStatus();
            }, 2000);
            return;
          }

          // Try to detect successful auth by checking URL changes
          try {
            const popupUrl = popup.location.href;
            // Check if we've been redirected back to our domain
            if (popupUrl.includes('localhost') || popupUrl.includes('vercel.app') || popupUrl.includes('herokuapp.com')) {
              // Auth completed, close popup
              popup.close();
              clearInterval(timer);
              setPollTimer(null);
              setAuthWindow(null);
              
              // Small delay then check auth status
              setTimeout(() => {
                checkAuthStatus();
              }, 1000);
            }
          } catch (e) {
            // Cross-origin error is expected during auth flow - continue polling
          }
        } catch (error) {
          // Handle polling errors gracefully
          console.log('Popup polling error (normal during auth):', error.message);
        }
      }, 1000);

      setPollTimer(timer);

      // Fallback: auto-close after 5 minutes to prevent memory leaks
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close();
          clearInterval(timer);
          setPollTimer(null);
          setAuthWindow(null);
          showNotification('Authentication timed out. Please try again.', 'warning');
        }
      }, 300000); // 5 minutes

    } catch (error) {
      console.error('Error opening auth popup:', error);
      showNotification('Failed to open authentication window. Please check popup settings.', 'error');
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    setUploadStep(3);
    
    try {
      // Add a small delay to ensure auth tokens are processed on the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await projectService.uploadToGoogleDrive(projectId);
      
      console.log('Auth Check Result:', result);
      
      if (result.success && result.driveLink) {
        setDriveLink(result.driveLink);
        setUploadStep(4);
        setUploadComplete(true);
        showNotification('Project uploaded to Google Drive successfully! 🎉', 'success');
        
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else if (result.success && result.status === 'uploaded') {
        // Alternative success format
        setDriveLink(result.driveLink);
        setUploadStep(4);
        setUploadComplete(true);
        showNotification('Project uploaded to Google Drive successfully! 🎉', 'success');
        
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else if (result.actionRequired === 'GOOGLE_OAUTH_REQUIRED') {
        // Still need auth - go back to step 2
        setUploadStep(2);
        showNotification('Google authentication is still required. Please try again.', 'warning');
      } else {
        showNotification(result.message || 'Upload failed. Please try again.', 'error');
        setUploadStep(2); // Go back to auth step
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showNotification('Failed to complete upload. Please try again.', 'error');
      setUploadStep(2); // Go back to auth step
    }
    setLoading(false);
  };

  const handleOpenDriveLink = () => {
    if (driveLink) {
      window.open(driveLink, '_blank');
    }
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const handleRetry = () => {
    cleanup();
    setUploadStep(1);
    setAuthUrl('');
    setLoading(false);
    setUploadComplete(false);
    setDriveLink('');
    initializeUpload();
  };

  return (
    <motion.div
      className="google-drive-upload-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload to Google Drive</h2>
          <button className="close-button" onClick={handleClose}>×</button>
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
          <button className="cancel-button" onClick={handleClose}>
            {uploadComplete ? 'Close' : 'Cancel'}
          </button>
          {uploadStep === 2 && !loading && (
            <button className="retry-button" onClick={handleRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GoogleDriveUpload; 