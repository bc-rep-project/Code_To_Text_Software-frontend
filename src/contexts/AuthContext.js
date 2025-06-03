import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        // Verify token is still valid
        await fetchUserDetails();
      } catch (error) {
        console.error('Token validation failed:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const fetchUserDetails = async () => {
    try {
      const response = await apiClient.get('/auth/user/');
      setUser(response.data);
      localStorage.setItem('userData', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login/', credentials);
      const { token, user: userData, message } = response.data;

      if (token && userData) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      }

      return { success: true, message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  // Google OAuth login function
  const loginWithGoogle = async (googleAccessToken) => {
    try {
      const response = await apiClient.post('/auth/google-oauth/', {
        access_token: googleAccessToken
      });
      
      const { token, user: userData, message } = response.data;

      if (token && userData) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      }

      return { success: true, message: message || 'Google login successful!' };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Google login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register/', userData);
      const { token, user: newUser, message } = response.data;

      if (token && newUser) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
      }

      return { success: true, message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile/update/', profileData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Profile update failed' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await apiClient.post('/auth/password/change/', passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Password change failed' 
      };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    changePassword,
    updateUser,
    fetchUserDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 