import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { showNotification } from '../components/common/NotificationManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [converting, setConverting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const result = await projectService.getProject(id);
      if (result.success) {
        setProject(result.project);
      } else {
        showNotification(result.message || 'Failed to load project', 'error');
        navigate('/projects');
      }
    } catch (error) {
      showNotification('Error loading project', 'error');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showNotification('Please select files to upload', 'error');
      return;
    }

    setUploading(true);
    try {
      const result = await projectService.uploadCode(id, selectedFiles);
      if (result.success) {
        showNotification(result.message || 'Files uploaded successfully!', 'success');
        setSelectedFiles([]);
        fetchProject(); // Refresh project data
      } else {
        showNotification(result.message || 'Upload failed', 'error');
      }
    } catch (error) {
      showNotification('Error uploading files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleScan = async () => {
    // Check if project can be scanned
    if (!['pending_scan', 'error'].includes(project.status)) {
      showNotification(`Cannot scan project in status: ${project.status}`, 'error');
      return;
    }

    setScanning(true);
    try {
      const result = await projectService.scanProject(id);
      if (result.success) {
        showNotification(result.message || 'Scan started successfully!', 'success');
        fetchProject(); // Refresh project data
      } else {
        showNotification(result.message || 'Scan failed', 'error');
      }
    } catch (error) {
      showNotification('Error starting scan', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleConvert = async () => {
    // Check if project can be converted
    if (!['scanned', 'error'].includes(project.status)) {
      showNotification(`Cannot convert project in status: ${project.status}. Please scan the project first.`, 'error');
      return;
    }

    setConverting(true);
    try {
      const result = await projectService.convertProject(id);
      if (result.success) {
        showNotification(result.message || 'Conversion started successfully!', 'success');
        fetchProject(); // Refresh project data
      } else {
        showNotification(result.message || 'Conversion failed', 'error');
      }
    } catch (error) {
      showNotification('Error starting conversion', 'error');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const result = await projectService.downloadProject(id);
      if (result.success) {
        showNotification(result.message || 'Download started!', 'success');
      } else {
        showNotification(result.message || 'Download failed', 'error');
      }
    } catch (error) {
      showNotification('Error downloading project', 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const result = await projectService.deleteProject(id);
        if (result.success) {
          showNotification(result.message || 'Project deleted successfully!', 'success');
          navigate('/projects');
        } else {
          showNotification(result.message || 'Delete failed', 'error');
        }
      } catch (error) {
        showNotification('Error deleting project', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_scan': { label: 'Pending Scan', class: 'status-created' },
      'scanning': { label: 'Scanning', class: 'status-scanning' },
      'scanned': { label: 'Scanned', class: 'status-progress' },
      'conversion_pending': { label: 'Conversion Pending', class: 'status-progress' },
      'converting': { label: 'Converting', class: 'status-converting' },
      'converted': { label: 'Converted', class: 'status-completed' },
      'uploading_to_drive': { label: 'Uploading to Drive', class: 'status-converting' },
      'completed': { label: 'Completed', class: 'status-completed' },
      'error': { label: 'Error', class: 'status-failed' },
      'monitoring_github': { label: 'Monitoring GitHub', class: 'status-progress' },
      // Legacy status mappings for compatibility
      'created': { label: 'Created', class: 'status-created' },
      'in_progress': { label: 'In Progress', class: 'status-progress' },
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
    return <LoadingSpinner message="Loading project..." />;
  }

  if (!project) {
    return (
      <div className="error-state">
        <h2>Project not found</h2>
        <button onClick={() => navigate('/projects')} className="btn btn-primary">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="project-header">
        <div className="header-content">
          <button 
            onClick={() => navigate('/projects')}
            className="back-button"
          >
            ← Back to Projects
          </button>
          <div className="project-title">
            <h1>{project.name}</h1>
            {getStatusBadge(project.status)}
          </div>
          <p className="project-description">
            {project.description || 'No description provided'}
          </p>
        </div>
        <div className="header-actions">
          {project.status === 'completed' && (
            <button 
              onClick={handleDownload}
              className="btn btn-success"
            >
              📥 Download Results
            </button>
          )}
          <button 
            onClick={handleDelete}
            className="btn btn-error"
          >
            🗑️ Delete Project
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="project-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Created:</span>
            <span className="info-value">{formatDate(project.created_at)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Updated:</span>
            <span className="info-value">{formatDate(project.updated_at)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Files:</span>
            <span className="info-value">{project.file_count || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value">{getStatusBadge(project.status)}</span>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="section">
        <h2>Upload Code Files</h2>
        <div className="upload-area">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="file-input"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.php,.rb,.go,.rs,.swift,.kt,.scala,.sh,.sql,.json,.xml,.yaml,.yml,.md,.txt"
          />
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files ({selectedFiles.length}):</h4>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                ))}
              </ul>
            </div>
          )}
          <button 
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="btn btn-primary"
          >
            {uploading ? <LoadingSpinner size="small" message="" /> : '📤 Upload Files'}
          </button>
        </div>
      </div>

      {/* Actions Section */}
      <div className="section">
        <h2>Project Actions</h2>
        <div className="actions-grid">
          <div className="action-card">
            <h3>1. Scan Project</h3>
            <p>Analyze uploaded files and prepare for conversion</p>
            <button 
              onClick={handleScan}
              disabled={scanning || !['pending_scan', 'error'].includes(project?.status)}
              className="btn btn-primary"
            >
              {scanning ? <LoadingSpinner size="small" message="" /> : '🔍 Start Scan'}
            </button>
            {!['pending_scan', 'error'].includes(project?.status) && (
              <small className="status-hint">Project already scanned</small>
            )}
          </div>

          <div className="action-card">
            <h3>2. Convert to Text</h3>
            <p>Convert your code files to readable text format</p>
            <button 
              onClick={handleConvert}
              disabled={converting || !['scanned', 'error'].includes(project?.status)}
              className="btn btn-primary"
            >
              {converting ? <LoadingSpinner size="small" message="" /> : '🔄 Start Conversion'}
            </button>
            {!['scanned', 'error'].includes(project?.status) && (
              <small className="status-hint">
                {project?.status === 'pending_scan' ? 'Please scan the project first' : `Cannot convert in status: ${project?.status}`}
              </small>
            )}
          </div>

          <div className="action-card">
            <h3>3. Download Results</h3>
            <p>Download the converted text files</p>
            <button 
              onClick={handleDownload}
              disabled={!['converted', 'completed'].includes(project?.status)}
              className="btn btn-success"
            >
              📥 Download
            </button>
            {!['converted', 'completed'].includes(project?.status) && (
              <small className="status-hint">Results not ready yet</small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 