import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';

// Layout components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetails from './pages/RepositoryDetail';
import Analysis from './pages/Analysis';
import Conversions from './pages/Conversions';
import ConversionDetails from './pages/ConversionDetail';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';

// Auth actions
import { getUserDetails } from './store/slices/authSlice';
import { closeSnackbar } from './store/slices/uiSlice';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public route - redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSelector(state => state.auth);
  const { snackbar } = useSelector(state => state.ui);
  
  // Load user details when app starts if token exists
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserDetails());
    }
  }, [dispatch, isAuthenticated]);
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Auth routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
        
        {/* Protected routes with main Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/repositories" element={
            <ProtectedRoute>
              <Repositories />
            </ProtectedRoute>
          } />
          <Route path="/repositories/:id" element={
            <ProtectedRoute>
              <RepositoryDetails />
            </ProtectedRoute>
          } />
          <Route path="/analysis/:id" element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          } />
          <Route path="/conversions" element={
            <ProtectedRoute>
              <Conversions />
            </ProtectedRoute>
          } />
          <Route path="/conversions/:id" element={
            <ProtectedRoute>
              <ConversionDetails />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => dispatch(closeSnackbar())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => dispatch(closeSnackbar())} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App; 