import api from './apiConfig';

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    
    // Store token and user in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Log in a user
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    
    // Store token and user in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Log out a user
  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } finally {
      // Always clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  // Google OAuth authentication
  googleAuth: async (authCode) => {
    const response = await api.post('/auth/google/', { code: authCode });
    
    // Store token and user in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Get current user details
  getUserDetails: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/user/', userData);
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },
  
  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/password/change/', passwordData);
    return response.data;
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password/reset/', { email });
    return response.data;
  },
  
  // Confirm password reset
  confirmPasswordReset: async (resetData) => {
    const response = await api.post('/auth/password/reset/confirm/', resetData);
    return response.data;
  },
  
  // Start trial
  startTrial: async () => {
    const response = await api.post('/auth/subscription/trial/');
    
    // Update stored user data with updated subscription info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      subscription: response.data.subscription
    }));
    
    return response.data;
  },
  
  // Subscribe to paid plan
  subscribe: async (paymentToken) => {
    const response = await api.post('/auth/subscription/', { payment_token: paymentToken });
    
    // Update stored user data with updated subscription info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      subscription: response.data.subscription
    }));
    
    return response.data;
  },
  
  // Cancel subscription
  cancelSubscription: async () => {
    const response = await api.delete('/auth/subscription/');
    
    // Update stored user data with updated subscription info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      subscription: response.data.subscription
    }));
    
    return response.data;
  },
  
  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/auth/user/');
    return response.data;
  }
};

export default authService; 