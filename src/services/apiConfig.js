import axios from 'axios';

// Base URL for API - set to match Django backend
// Use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Log the API URL being used (helpful for debugging)
console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 20000,
});

// Add request interceptor to include auth token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle standard errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log errors for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', error);
    }
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Clear tokens if they exist
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Return a standardized error format
    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message || error.message || 'Unknown error occurred',
    });
  }
);

export default api; 