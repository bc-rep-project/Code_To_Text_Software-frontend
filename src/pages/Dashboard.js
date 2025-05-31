import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/projectService';
import { showNotification } from '../components/common/NotificationManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const result = await projectService.getProjects();
      
      if (result.success) {
        setProjects(result.projects.slice(0, 5)); // Show only recent 5 projects
        
        // Calculate stats
        const totalProjects = result.projects.length;
        const completedProjects = result.projects.filter(p => p.status === 'completed').length;
        const activeProjects = result.projects.filter(p => ['in_progress', 'scanning', 'converting'].includes(p.status)).length;
        const totalFiles = result.projects.reduce((sum, p) => sum + (p.file_count || 0), 0);
        
        setStats({
          totalProjects,
          completedProjects,
          activeProjects,
          totalFiles
        });
      } else {
        showNotification(result.message || 'Failed to load dashboard data', 'error');
      }
    } catch (error) {
      showNotification('Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/projects');
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
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.first_name || user?.username}!</h1>
          <p>Manage your code conversion projects and track your progress.</p>
        </div>
        
        <button 
          className="create-project-btn"
          onClick={handleCreateProject}
        >
          <span>+</span>
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalProjects}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedProjects}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>{stats.activeProjects}</h3>
            <p>Active</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>{stats.totalFiles}</h3>
            <p>Files Processed</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="recent-projects">
        <div className="section-header">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="view-all-link">
            View All Projects →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No projects yet</h3>
            <p>Create your first project to start converting code to text.</p>
            <button 
              className="create-first-project-btn"
              onClick={handleCreateProject}
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map(project => (
              <Link 
                to={`/projects/${project.id}`} 
                key={project.id}
                className="project-card"
              >
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p className="project-description">
                    {project.description || 'No description provided'}
                  </p>
                  <div className="project-meta">
                    <span className="project-date">
                      Created {formatDate(project.created_at)}
                    </span>
                    {project.file_count > 0 && (
                      <span className="project-files">
                        {project.file_count} files
                      </span>
                    )}
                  </div>
                </div>
                <div className="project-status">
                  {getStatusBadge(project.status)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/projects" className="action-card">
            <div className="action-icon">📁</div>
            <h3>Browse Projects</h3>
            <p>View and manage all your projects</p>
          </Link>
          
          <Link to="/profile" className="action-card">
            <div className="action-icon">👤</div>
            <h3>Profile Settings</h3>
            <p>Update your account information</p>
          </Link>
          
          <Link to="/subscription" className="action-card">
            <div className="action-icon">💳</div>
            <h3>Subscription</h3>
            <p>Manage your subscription plan</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 