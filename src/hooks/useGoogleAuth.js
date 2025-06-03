import { useState, useEffect } from 'react';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const signInWithGoogle = () => {
    return new Promise((resolve, reject) => {
      if (!window.google || !isGoogleLoaded) {
        reject(new Error('Google script not loaded'));
        return;
      }

      window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: (response) => {
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to get Google access token'));
          }
        },
        error_callback: (error) => {
          reject(new Error(`Google OAuth error: ${error.error}`));
        }
      }).requestAccessToken();
    });
  };

  return {
    isGoogleLoaded,
    signInWithGoogle
  };
};
