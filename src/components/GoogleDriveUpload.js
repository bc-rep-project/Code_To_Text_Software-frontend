import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import projectService from '../services/projectService';
import { showNotification } from './common/EnhancedNotificationManager';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import LoadingSpinner from './common/LoadingSpinner';
import './GoogleDriveUpload.css';

const GoogleDriveUpload = ({ projectId, onUploadComplete, onClose }) => {
  const [uploadStep, setUploadStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [needsAuth, setNeedsAuth] = useState(false);
  
  // Use the same Google auth hook as login/register
  const { isGoogleLoaded, signInWithGoogle } = useGoogleAuth();

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
          setNeedsAuth(true);
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

  const handleGoogleAuth = async () => {
    if (!isGoogleLoaded) {
      showNotification('Google authentication is not ready. Please try again.', 'error');
      return;
    }

    setLoading(true);
    
    try {
      showNotification('Opening Google authentication...', 'info');
      
      // Use the same popup mechanism as login/register
      const googleAccessToken = await signInWithGoogle();
      
      if (googleAccessToken) {
        showNotification('Google authentication successful! Processing...', 'success');
        
        // Now proceed with the upload using the token
        await checkAuthStatusAndUpload();
      } else {
        showNotification('Failed to get Google access token', 'error');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      
      if (error.message.includes('popup_closed_by_user')) {
        showNotification('Google sign-in was cancelled', 'info');
      } else if (error.message.includes('access_denied')) {
        showNotification('Google sign-in access denied', 'error');
      } else {
        showNotification('Google sign-in failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatusAndUpload = async () => {
    setLoading(true);
    setUploadStep(3);
    
    try {
      // Add a small delay to ensure auth tokens are processed on the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await projectService.uploadToGoogleDrive(projectId);
      
      console.log('Upload Result:', result);
      
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
        setNeedsAuth(true);
        showNotification('Google authentication is still required. Please try again.', 'warning');
      } else {
        showNotification(result.message || 'Upload failed. Please try again.', 'error');
        setUploadStep(2); // Go back to auth step
      }
    } catch (error) {
      console.error('Upload check failed:', error);
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

  const handleRetry = () => {
    setUploadStep(1);
    setNeedsAuth(false);
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
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              {loading && <LoadingSpinner size="small" message="" />}
            </div>
          )}

          {uploadStep === 2 && (
            <div className="step-info">
              <p>Click below to authenticate with Google Drive</p>
              <button 
                className="auth-button"
                onClick={handleGoogleAuth}
                disabled={loading || !isGoogleLoaded}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" message="" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Authenticate with Google</span>
                  </>
                )}
              </button>
              <p className="help-text">
                This will open a Google authentication popup.
                Please complete the login process to continue.
              </p>
            </div>
          )}

          {uploadStep === 3 && (
            <div className="step-info">
              <p>Uploading your project to Google Drive...</p>
              <LoadingSpinner size="small" message="" />
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