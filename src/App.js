import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EnhancedLoadingSpinner from './components/common/EnhancedLoadingSpinner';
import { NotificationToaster } from './components/common/EnhancedNotificationManager';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './styles/global.css';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Projects = React.lazy(() => import('./pages/Projects'));
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Subscription = React.lazy(() => import('./pages/Subscription'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <EnhancedLoadingSpinner 
        message="Checking authentication..." 
        type="default"
        size="large"
        fullScreen={true}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Public Route Component (redirects if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <EnhancedLoadingSpinner 
        message="Loading application..." 
        type="default"
        size="large"
        fullScreen={true}
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// App Layout Component
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize AOS globally
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    });

    // Refresh AOS on route changes
    AOS.refresh();
  }, []);

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {isAuthenticated && (
          <motion.div
            key="navbar"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className={`main-content ${!isAuthenticated ? 'no-navbar' : ''}`}>
        <AnimatePresence mode="wait">
          <Suspense 
            fallback={
              <EnhancedLoadingSpinner 
                message="Loading page..." 
                type="default"
                size="large"
                fullScreen={true}
              />
            }
          >
            {children}
          </Suspense>
        </AnimatePresence>
      </main>
      
      <AnimatePresence mode="wait">
        {isAuthenticated && (
          <motion.div
            key="footer"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Notification System */}
      <NotificationToaster />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects/:id" 
                element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/subscription" 
                element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App; 