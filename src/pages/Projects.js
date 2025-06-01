import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { showNotification } from '../components/common/NotificationManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const result = await projectService.getProjects();
      if (result.success) {
        setProjects(result.projects);
      } else {
        showNotification(result.message || 'Failed to load projects', 'error');
      }
    } catch (error) {
      showNotification('Error loading projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    console.log('Resetting form data');
    setFormData({ name: '', description: '' });
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
    
    // Debug logging
    console.log('Form submission triggered');
    console.log('Form data:', formData);
    console.log('Project name value:', formData.name);
    console.log('Project name length:', formData.name.length);
    console.log('Project name trimmed:', formData.name.trim());
    console.log('Project name trimmed length:', formData.name.trim().length);
    
    if (!formData.name || !formData.name.trim()) {
      console.log('Validation failed: Project name is empty');
      showNotification('Project name is required', 'error');
      return;
    }

    setCreateLoading(true);
    
    try {
      console.log('Sending project data to API:', formData);
      const result = await projectService.createProject(formData);
      
      console.log('API response:', result);
      
      if (result.success) {
        showNotification(result.message || 'Project created successfully!', 'success');
        closeCreateModal();
        fetchProjects(); // Refresh the list
        navigate(`/projects/${result.project.id}`);
      } else {
        showNotification(result.message || 'Failed to create project', 'error');
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
      'created': { label: 'Created', class: 'status-created' },
      'in_progress': { label: 'In Progress', class: 'status-progress' },
      'scanning': { label: 'Scanning', class: 'status-scanning' },
      'converting': { label: 'Converting', class: 'status-converting' },
      'completed': { label: 'Completed', class: 'status-completed' },
      'failed': { label: 'Failed', class: 'status-failed' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
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

  if (loading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div className="header-content">
          <h1>My Projects</h1>
          <p>Manage your code conversion projects</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <span>+</span>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to start converting code to text.</p>
          <button 
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <Link 
              to={`/projects/${project.id}`} 
              key={project.id}
              className="project-card"
            >
              <div className="project-header">
                <h3>{project.name}</h3>
                {getStatusBadge(project.status)}
              </div>
              
              <p className="project-description">
                {project.description || 'No description provided'}
              </p>
              
              <div className="project-meta">
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">{formatDate(project.created_at)}</span>
                </div>
                {project.file_count > 0 && (
                  <div className="meta-item">
                    <span className="meta-label">Files:</span>
                    <span className="meta-value">{project.file_count}</span>
                  </div>
                )}
                {project.updated_at && (
                  <div className="meta-item">
                    <span className="meta-label">Updated:</span>
                    <span className="meta-value">{formatDate(project.updated_at)}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button 
                className="modal-close"
                onClick={closeCreateModal}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    console.log('Name input changed:', e.target.value);
                    setFormData({ ...formData, name: e.target.value });
                  }}
                  onBlur={(e) => {
                    console.log('Name input blurred:', e.target.value);
                  }}
                  placeholder="Enter project name"
                  disabled={createLoading}
                  required
                  autoComplete="off"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                    console.log('Description input changed:', e.target.value);
                    setFormData({ ...formData, description: e.target.value });
                  }}
                  placeholder="Enter project description (optional)"
                  rows="3"
                  disabled={createLoading}
                  autoComplete="off"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeCreateModal}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? <LoadingSpinner size="small" message="" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects; 