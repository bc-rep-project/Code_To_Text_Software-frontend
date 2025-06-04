import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';
import { showNotification, showAsyncNotification } from '../components/common/EnhancedNotificationManager';
import EnhancedLoadingSpinner from '../components/common/EnhancedLoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0,
    totalFiles: 0
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const dashboardPromise = projectService.getProjects();
      
      const result = await showAsyncNotification(
        dashboardPromise,
        {
          loading: 'Loading dashboard data...',
          success: 'Dashboard loaded successfully!',
          error: 'Failed to load dashboard data'
        }
      );
      
      if (result.success) {
        setProjects(result.projects.slice(0, 5)); // Show only recent 5 projects
        
        // Calculate stats with animations
        const totalProjects = result.projects.length;
        const completedProjects = result.projects.filter(p => ['converted', 'completed'].includes(p.status)).length;
        const activeProjects = result.projects.filter(p => ['scanning', 'converting', 'uploading_to_drive'].includes(p.status)).length;
        const totalFiles = result.projects.reduce((sum, p) => sum + (p.file_count || 0), 0);
        
        // Animate stats counting up
        animateStats({
          totalProjects,
          completedProjects,
          activeProjects,
          totalFiles
        });
      }
    } catch (error) {
      showNotification('Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const animateStats = (finalStats) => {
    const duration = 1500;
    const steps = 50;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(interval);
        setStats(finalStats);
        return;
      }
      
      const progress = currentStep / steps;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setStats({
        totalProjects: Math.floor(finalStats.totalProjects * easeOutProgress),
        completedProjects: Math.floor(finalStats.completedProjects * easeOutProgress),
        activeProjects: Math.floor(finalStats.activeProjects * easeOutProgress),
        totalFiles: Math.floor(finalStats.totalFiles * easeOutProgress)
      });
      
      currentStep++;
    }, stepDuration);
  };

  const handleCreateProject = () => {
    navigate('/projects');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_scan': { label: 'Pending Scan', class: 'status-created', color: '#6b7280' },
      'scanning': { label: 'Scanning', class: 'status-scanning', color: '#f59e0b' },
      'scanned': { label: 'Scanned', class: 'status-progress', color: '#3b82f6' },
      'conversion_pending': { label: 'Conversion Pending', class: 'status-progress', color: '#3b82f6' },
      'converting': { label: 'Converting', class: 'status-converting', color: '#8b5cf6' },
      'converted': { label: 'Converted', class: 'status-completed', color: '#22c55e' },
      'uploading_to_drive': { label: 'Uploading to Drive', class: 'status-converting', color: '#06b6d4' },
      'completed': { label: 'Completed', class: 'status-completed', color: '#22c55e' },
      'error': { label: 'Error', class: 'status-failed', color: '#ef4444' },
      'monitoring_github': { label: 'Monitoring GitHub', class: 'status-progress', color: '#3b82f6' },
      // Legacy status mappings for compatibility
      'created': { label: 'Created', class: 'status-created', color: '#6b7280' },
      'in_progress': { label: 'In Progress', class: 'status-progress', color: '#3b82f6' },
      'failed': { label: 'Failed', class: 'status-failed', color: '#ef4444' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-default', color: '#6b7280' };
    return (
      <motion.span 
        className={`status-badge ${config.class}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </motion.span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const statCardVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2
      }
    }
  };

  const projectCardVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      x: 10,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2
      }
    }
  };

  if (loading) {
    return (
      <EnhancedLoadingSpinner 
        message="Loading your dashboard..." 
        type="default"
        size="large"
        fullScreen={true}
      />
    );
  }

  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div className="welcome-section" data-aos="fade-right">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome back, {user?.first_name || user?.username}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Manage your code conversion projects and track your progress.
          </motion.p>
        </div>
        
        <motion.button 
          className="create-project-btn"
          onClick={handleCreateProject}
          data-aos="fade-left"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.span
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            +
          </motion.span>
          New Project
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="stats-grid" variants={itemVariants}>
        {[
          { icon: '📊', value: stats.totalProjects, label: 'Total Projects', color: '#3b82f6' },
          { icon: '✅', value: stats.completedProjects, label: 'Completed', color: '#22c55e' },
          { icon: '⚡', value: stats.activeProjects, label: 'Active', color: '#f59e0b' },
          { icon: '📁', value: stats.totalFiles, label: 'Files Processed', color: '#8b5cf6' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            variants={statCardVariants}
            whileHover="hover"
            data-aos="zoom-in"
            data-aos-delay={index * 100}
            style={{ borderTopColor: stat.color }}
          >
            <motion.div 
              className="stat-icon"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2,
                delay: index * 0.2
              }}
            >
              {stat.icon}
            </motion.div>
            <div className="stat-content">
              <motion.h3
                key={stat.value}
                initial={{ scale: 1.2, color: stat.color }}
                animate={{ scale: 1, color: '#111827' }}
                transition={{ duration: 0.3 }}
              >
                {stat.value}
              </motion.h3>
              <p>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Projects */}
      <motion.div className="recent-projects" variants={itemVariants}>
        <motion.div 
          className="section-header"
          data-aos="fade-up"
        >
          <h2>Recent Projects</h2>
          <Link to="/projects" className="view-all-link">
            <motion.span
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              View All Projects →
            </motion.span>
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {projects.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              data-aos="fade-up"
            >
              <motion.div 
                className="empty-icon"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                📝
              </motion.div>
              <h3>No projects yet</h3>
              <p>Create your first project to start converting code to text.</p>
              <motion.button 
                className="create-first-project-btn"
                onClick={handleCreateProject}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Project
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="projects-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={projectCardVariants}
                  whileHover="hover"
                  data-aos="slide-right"
                  data-aos-delay={index * 100}
                >
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="project-card"
                  >
                    <div className="project-info">
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {project.name}
                      </motion.h3>
                      <motion.p 
                        className="project-description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {project.description || 'No description provided'}
                      </motion.p>
                      <motion.div 
                        className="project-meta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <span className="project-date">
                          Created {formatDate(project.created_at)}
                        </span>
                        {project.file_count > 0 && (
                          <motion.span 
                            className="project-files"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                          >
                            {project.file_count} files
                          </motion.span>
                        )}
                      </motion.div>
                    </div>
                    <motion.div 
                      className="project-status"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {getStatusBadge(project.status)}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="quick-actions"
        variants={itemVariants}
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {[
            { icon: '📤', label: 'Upload Files', action: () => navigate('/projects'), color: '#22c55e' },
            { icon: '🔍', label: 'Browse Projects', action: () => navigate('/projects'), color: '#3b82f6' },
            { icon: '👤', label: 'Profile Settings', action: () => navigate('/profile'), color: '#8b5cf6' },
            { icon: '💳', label: 'Subscription', action: () => navigate('/subscription'), color: '#f59e0b' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              className="action-card"
              onClick={action.action}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: action.color + '20'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              data-aos="zoom-in"
              data-aos-delay={index * 50}
            >
              <motion.span 
                className="action-icon"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  delay: index * 0.2
                }}
                style={{ color: action.color }}
              >
                {action.icon}
              </motion.span>
              <span>{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 