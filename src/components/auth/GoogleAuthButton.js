import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { showNotification } from '../common/NotificationManager';
import LoadingSpinner from '../common/LoadingSpinner';

const GoogleAuthButton = ({ text = "Continue with Google", onSuccess, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const { isGoogleLoaded, signInWithGoogle } = useGoogleAuth();

  const handleGoogleAuth = async () => {
    if (loading || disabled || !isGoogleLoaded) return;

    setLoading(true);
    
    try {
      // Get Google access token
      const googleAccessToken = await signInWithGoogle();
      
      // Send to backend for authentication
      const result = await loginWithGoogle(googleAccessToken);
      
      if (result.success) {
        showNotification(result.message, 'success');
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        showNotification(result.message, 'error');
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

  return (
    <button 
      className="social-button google"
      onClick={handleGoogleAuth}
      disabled={loading || disabled || !isGoogleLoaded}
      type="button"
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" message="" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <span>🔍</span>
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default GoogleAuthButton; 