import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { projectService } from '../services/projectService';
import { showNotification, showAsyncNotification } from '../components/common/EnhancedNotificationManager';
import EnhancedLoadingSpinner from '../components/common/EnhancedLoadingSpinner';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source_type: 'upload',
    github_repo_url: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });

    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsPromise = projectService.getProjects();
      
      const result = await showAsyncNotification(
        projectsPromise,
        {
          loading: 'Loading your projects...',
          success: 'Projects loaded successfully!',
          error: 'Failed to load projects'
        }
      );
      
      if (result.success) {
        setProjects(result.projects);
      }
    } catch (error) {
      showNotification('Error loading projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    console.log('Resetting form data');
    setFormData({ name: '', description: '', source_type: 'upload', github_repo_url: '' });
  };

  const openCreateModal = () => {
    console.log('Opening create modal');
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    console.log('Closing create modal');
    setShowCreateModal(false);
    resetForm();
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    console.log('Form submission triggered');
    console.log('Form data:', formData);
    
    if (!formData.name || !formData.name.trim()) {
      console.log('Validation failed: Project name is empty');
      showNotification('Project name is required', 'error');
      return;
    }

    // Additional validation for GitHub projects
    if (formData.source_type === 'github') {
      if (!formData.github_repo_url || !formData.github_repo_url.trim()) {
        showNotification('GitHub repository URL is required for GitHub projects', 'error');
        return;
      }
      
      // Basic GitHub URL validation
      const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
      if (!githubUrlPattern.test(formData.github_repo_url.trim())) {
        showNotification('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)', 'error');
        return;
      }
    }

    setCreateLoading(true);
    
    try {
      console.log('Sending project data to API:', formData);
      
      const createProjectPromise = projectService.createProject(formData);
      
      const result = await showAsyncNotification(
        createProjectPromise,
        {
          loading: 'Creating your project...',
          success: '🎉 Project created successfully!',
          error: 'Failed to create project'
        }
      );
      
      if (result.success) {
        showNotification(
          'Project created successfully! 🚀', 
          'success', 
          { celebration: true }
        );
        closeCreateModal();
        fetchProjects(); // Refresh the list
        navigate(`/projects/${result.project.id}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      showNotification('Error creating project', 'error');
    } finally {
      setCreateLoading(false);
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      y: -5,
      boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  if (loading) {
    return (
      <EnhancedLoadingSpinner 
        message="Loading your projects..." 
        type="default"
        size="large"
        fullScreen={true}
      />
    );
  }

  return (
    <motion.div 
      className="projects-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="projects-header" variants={itemVariants}>
        <div className="header-content" data-aos="fade-right">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            My Projects 🚀
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Manage your code conversion projects
          </motion.p>
        </div>
        <motion.button 
          className="btn btn-primary"
          onClick={openCreateModal}
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

      {/* Projects Grid/Empty State */}
      <motion.div variants={itemVariants}>
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
                📁
              </motion.div>
              <h3>No projects yet</h3>
              <p>Create your first project to start converting code to text.</p>
              <motion.button 
                className="btn btn-primary"
                onClick={openCreateModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Project
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="projects-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={projectCardVariants}
                  whileHover="hover"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="project-card"
                  >
                    <motion.div 
                      className="project-header"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        {project.name}
                      </motion.h3>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        {getStatusBadge(project.status)}
                      </motion.div>
                    </motion.div>
                    
                    <motion.p 
                      className="project-description"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {project.description || 'No description provided'}
                    </motion.p>
                    
                    <motion.div 
                      className="project-meta"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">{formatDate(project.created_at)}</span>
                      </div>
                      {project.file_count > 0 && (
                        <motion.div 
                          className="meta-item"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        >
                          <span className="meta-label">Files:</span>
                          <span className="meta-value files-count">
                            {project.file_count}
                          </span>
                        </motion.div>
                      )}
                      {project.source_type && (
                        <div className="meta-item">
                          <span className="meta-label">Type:</span>
                          <span className="meta-value">
                            {project.source_type === 'github' ? '🔗 GitHub' : '📁 Upload'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            className="modal-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCreateModal}
          >
            <motion.div 
              className="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Create New Project</h2>
                <motion.button 
                  className="close-button"
                  onClick={closeCreateModal}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>
              
              <form onSubmit={handleCreateProject} className="modal-content">
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="name">Project Name *</label>
                  <motion.input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                    required
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
                
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="description">Description</label>
                  <motion.textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter project description (optional)"
                    rows="3"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
                
                <motion.div 
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="source_type">Source Type</label>
                  <motion.select
                    id="source_type"
                    value={formData.source_type}
                    onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <option value="upload">File Upload</option>
                    <option value="github">GitHub Repository</option>
                  </motion.select>
                </motion.div>
                
                <AnimatePresence>
                  {formData.source_type === 'github' && (
                    <motion.div 
                      className="form-group"
                      initial={{ opacity: 0, height: 0, x: -20 }}
                      animate={{ opacity: 1, height: 'auto', x: 0 }}
                      exit={{ opacity: 0, height: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="github_repo_url">GitHub Repository URL *</label>
                      <motion.input
                        type="url"
                        id="github_repo_url"
                        value={formData.github_repo_url}
                        onChange={(e) => setFormData({ ...formData, github_repo_url: e.target.value })}
                        placeholder="https://github.com/username/repository"
                        required={formData.source_type === 'github'}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div 
                  className="modal-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeCreateModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={createLoading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={createLoading}
                    whileHover={{ scale: createLoading ? 1 : 1.05 }}
                    whileTap={{ scale: createLoading ? 1 : 0.95 }}
                  >
                    {createLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ display: 'inline-block' }}
                      >
                        ⚡
                      </motion.div>
                    ) : (
                      'Create Project'
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Projects; 