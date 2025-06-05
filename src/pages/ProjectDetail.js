import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { projectService } from '../services/projectService';
import { showNotification, showAsyncNotification } from '../components/common/EnhancedNotificationManager';
import EnhancedLoadingSpinner, { 
  UploadLoadingSpinner, 
  ScanLoadingSpinner, 
  ConvertLoadingSpinner, 
  DownloadLoadingSpinner 
} from '../components/common/EnhancedLoadingSpinner';
import GoogleDriveUpload from '../components/GoogleDriveUpload';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [converting, setConverting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });

    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const projectPromise = projectService.getProject(id);
      
      const result = await showAsyncNotification(
        projectPromise,
        {
          loading: 'Loading project details...',
          success: 'Project loaded successfully!',
          error: 'Failed to load project'
        }
      );
      
      if (result.success) {
        setProject(result.project);
      } else {
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
    
    if (files.length > 0) {
      showNotification(
        `${files.length} file${files.length > 1 ? 's' : ''} selected for upload`,
        'info'
      );
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showNotification('Please select files to upload', 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadPromise = projectService.uploadCode(id, selectedFiles);
      
      const result = await showAsyncNotification(
        uploadPromise,
        {
          loading: `Uploading ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}...`,
          success: '🎉 Files uploaded successfully!',
          error: 'Upload failed'
        }
      );
      
      if (result.success) {
        showNotification(
          'Files uploaded successfully! 🚀', 
          'success', 
          { celebration: true }
        );
        setSelectedFiles([]);
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        
        fetchProject(); // Refresh project data
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
      const scanPromise = projectService.scanProject(id);
      
      const result = await showAsyncNotification(
        scanPromise,
        {
          loading: 'Scanning project files...',
          success: '🔍 Project scan started successfully!',
          error: 'Scan failed'
        }
      );
      
      if (result.success) {
        showNotification(
          'Scan started successfully! 🔍', 
          'success', 
          { celebration: true }
        );
        fetchProject(); // Refresh project data
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
      const convertPromise = projectService.convertProject(id);
      
      const result = await showAsyncNotification(
        convertPromise,
        {
          loading: 'Converting code to text...',
          success: '✨ Conversion started successfully!',
          error: 'Conversion failed'
        }
      );
      
      if (result.success) {
        showNotification(
          'Conversion started successfully! ✨', 
          'success', 
          { celebration: true }
        );
        fetchProject(); // Refresh project data
      }
    } catch (error) {
      showNotification('Error starting conversion', 'error');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const downloadPromise = projectService.downloadProject(id);
      
      const result = await showAsyncNotification(
        downloadPromise,
        {
          loading: 'Preparing download...',
          success: '📥 Download started!',
          error: 'Download failed'
        }
      );
      
      if (result.success) {
        showNotification(
          'Download started! 📥', 
          'success', 
          { celebration: true }
        );
      }
    } catch (error) {
      showNotification('Error downloading project', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleGoogleDriveUpload = () => {
    // Check if project has been converted
    if (!['converted', 'completed'].includes(project.status)) {
      showNotification(`Cannot upload to Google Drive. Project status: ${project.status}. Please convert the project first.`, 'error');
      return;
    }

    setShowGoogleDriveModal(true);
  };

  const handleGoogleDriveUploadComplete = (result) => {
    showNotification(
      'Project uploaded to Google Drive successfully! 🎉',
      'success',
      { celebration: true, duration: 10000 }
    );
    setShowGoogleDriveModal(false);
    fetchProject(); // Refresh project data to show updated status
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    
    if (confirmed) {
      try {
        const deletePromise = projectService.deleteProject(id);
        
        const result = await showAsyncNotification(
          deletePromise,
          {
            loading: 'Deleting project...',
            success: '🗑️ Project deleted successfully!',
            error: 'Delete failed'
          }
        );
        
        if (result.success) {
          showNotification(
            'Project deleted successfully! 🗑️', 
            'success', 
            { celebration: false }
          );
          navigate('/projects');
        }
      } catch (error) {
        showNotification('Error deleting project', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_scan': { label: 'Pending Scan', class: 'status-created', color: '#6b7280', icon: '⏳' },
      'scanning': { label: 'Scanning', class: 'status-scanning', color: '#f59e0b', icon: '🔍' },
      'scanned': { label: 'Scanned', class: 'status-progress', color: '#3b82f6', icon: '✅' },
      'conversion_pending': { label: 'Conversion Pending', class: 'status-progress', color: '#3b82f6', icon: '⏳' },
      'converting': { label: 'Converting', class: 'status-converting', color: '#8b5cf6', icon: '⚡' },
      'converted': { label: 'Converted', class: 'status-completed', color: '#22c55e', icon: '✨' },
      'uploading_to_drive': { label: 'Uploading to Drive', class: 'status-converting', color: '#06b6d4', icon: '☁️' },
      'completed': { label: 'Completed', class: 'status-completed', color: '#22c55e', icon: '🎉' },
      'error': { label: 'Error', class: 'status-failed', color: '#ef4444', icon: '❌' },
      'monitoring_github': { label: 'Monitoring GitHub', class: 'status-progress', color: '#3b82f6', icon: '👁️' },
      // Legacy status mappings for compatibility
      'created': { label: 'Created', class: 'status-created', color: '#6b7280', icon: '📝' },
      'in_progress': { label: 'In Progress', class: 'status-progress', color: '#3b82f6', icon: '⚡' },
      'failed': { label: 'Failed', class: 'status-failed', color: '#ef4444', icon: '❌' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-default', color: '#6b7280', icon: '❓' };
    return (
      <motion.span 
        className={`status-badge ${config.class}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{ backgroundColor: config.color }}
      >
        <span className="status-icon">{config.icon}</span>
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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };

  if (loading) {
    return (
      <EnhancedLoadingSpinner 
        message="Loading project details..." 
        type="default"
        size="large"
        fullScreen={true}
      />
    );
  }

  if (!project) {
    return (
      <motion.div 
        className="error-state"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            rotateY: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ fontSize: '4rem', marginBottom: '1rem' }}
        >
          😵
        </motion.div>
        <h2>Project not found</h2>
        <motion.button 
          onClick={() => navigate('/projects')} 
          className="btn btn-primary"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Back to Projects
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="project-detail"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="project-header" variants={itemVariants}>
        <motion.button 
          onClick={() => navigate('/projects')}
          className="back-button"
          data-aos="fade-right"
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          ← Back to Projects
        </motion.button>
        
        <div className="header-content" data-aos="fade-up">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {project.project_name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            {getStatusBadge(project.status)}
          </motion.div>
        </div>
      </motion.div>

      {/* Project Info */}
      <motion.div className="project-info-section" variants={itemVariants}>
        <div className="info-grid" data-aos="fade-up">
          <motion.div 
            className="info-card"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <h3>📋 Project Details</h3>
            <div className="info-item">
              <span className="label">Description:</span>
              <span className="value">No description available</span>
            </div>
            <div className="info-item">
              <span className="label">Created:</span>
              <span className="value">{formatDate(project.created_at)}</span>
            </div>
            {project.updated_at && (
              <div className="info-item">
                <span className="label">Updated:</span>
                <span className="value">{formatDate(project.updated_at)}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">Source Type:</span>
              <span className="value">
                {project.source_type === 'github' ? '🔗 GitHub Repository' : '📁 File Upload'}
              </span>
            </div>
          </motion.div>

          <motion.div 
            className="info-card"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <h3>📊 Statistics</h3>
            <div className="stats-grid">
              <motion.div 
                className="stat-item"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="stat-value">{project.file_count || 0}</span>
                <span className="stat-label">Files</span>
              </motion.div>
              <motion.div 
                className="stat-item"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="stat-value">{project.size || 'N/A'}</span>
                <span className="stat-label">Size</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* File Upload Section */}
      {project.source_type === 'upload' && (
        <motion.div className="upload-section" variants={itemVariants}>
          <motion.div 
            className="section-card"
            data-aos="slide-right"
          >
            <h2>📁 Upload Files</h2>
            <div className="upload-content">
              <motion.div 
                className="file-input-wrapper"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="file-input"
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.dart"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="file-input-label">
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    📤
                  </motion.span>
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                    : 'Choose files to upload'
                  }
                </label>
              </motion.div>
              
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div 
                    className="selected-files"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4>Selected Files:</h4>
                    <motion.ul>
                      {selectedFiles.map((file, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                variants={buttonVariants}
                whileHover={selectedFiles.length > 0 && !uploading ? "hover" : {}}
                whileTap={selectedFiles.length > 0 && !uploading ? "tap" : {}}
              >
                {uploading ? (
                  <UploadLoadingSpinner message="" />
                ) : (
                  <>
                    <motion.span
                      animate={{ rotate: uploading ? 360 : 0 }}
                      transition={{ duration: 1, repeat: uploading ? Infinity : 0, ease: "linear" }}
                    >
                      📤
                    </motion.span>
                    Upload Files
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Actions Section */}
      <motion.div className="actions-section" variants={itemVariants}>
        <motion.div 
          className="section-card"
          data-aos="slide-left"
        >
          <h2>🛠️ Project Actions</h2>
          <div className="actions-grid">
            {/* Scan Button */}
            <motion.button
              className={`action-btn scan-btn ${['pending_scan', 'error'].includes(project.status) ? 'enabled' : 'disabled'}`}
              onClick={handleScan}
              disabled={!['pending_scan', 'error'].includes(project.status) || scanning}
              variants={buttonVariants}
              whileHover={['pending_scan', 'error'].includes(project.status) && !scanning ? "hover" : {}}
              whileTap={['pending_scan', 'error'].includes(project.status) && !scanning ? "tap" : {}}
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              {scanning ? (
                <ScanLoadingSpinner message="" />
              ) : (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="action-icon"
                  >
                    🔍
                  </motion.span>
                  <div>
                    <h3>Scan Project</h3>
                    <p>Analyze and scan project files</p>
                  </div>
                </>
              )}
            </motion.button>

            {/* Convert Button */}
            <motion.button
              className={`action-btn convert-btn ${['scanned', 'error'].includes(project.status) ? 'enabled' : 'disabled'}`}
              onClick={handleConvert}
              disabled={!['scanned', 'error'].includes(project.status) || converting}
              variants={buttonVariants}
              whileHover={['scanned', 'error'].includes(project.status) && !converting ? "hover" : {}}
              whileTap={['scanned', 'error'].includes(project.status) && !converting ? "tap" : {}}
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              {converting ? (
                <ConvertLoadingSpinner message="" />
              ) : (
                <>
                  <motion.span
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="action-icon"
                  >
                    ⚡
                  </motion.span>
                  <div>
                    <h3>Convert to Text</h3>
                    <p>Convert code files to text format</p>
                  </div>
                </>
              )}
            </motion.button>

            {/* Download Button */}
            <motion.button
              className={`action-btn download-btn ${['converted', 'completed'].includes(project.status) ? 'enabled' : 'disabled'}`}
              onClick={handleDownload}
              disabled={!['converted', 'completed'].includes(project.status) || downloading}
              variants={buttonVariants}
              whileHover={['converted', 'completed'].includes(project.status) && !downloading ? "hover" : {}}
              whileTap={['converted', 'completed'].includes(project.status) && !downloading ? "tap" : {}}
              data-aos="zoom-in"
              data-aos-delay="300"
            >
              {downloading ? (
                <DownloadLoadingSpinner message="" />
              ) : (
                <>
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="action-icon"
                  >
                    📥
                  </motion.span>
                  <div>
                    <h3>Download Result</h3>
                    <p>Download converted text files</p>
                  </div>
                </>
              )}
            </motion.button>

            {/* Google Drive Upload Button */}
            <motion.button
              className={`action-btn google-drive-btn ${['converted', 'completed'].includes(project.status) ? 'enabled' : 'disabled'}`}
              onClick={handleGoogleDriveUpload}
              disabled={!['converted', 'completed'].includes(project.status) || downloading}
              variants={buttonVariants}
              whileHover={['converted', 'completed'].includes(project.status) && !downloading ? "hover" : {}}
              whileTap={['converted', 'completed'].includes(project.status) && !downloading ? "tap" : {}}
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <motion.span
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
                className="action-icon"
              >
                💾
              </motion.span>
              <div>
                <h3>Upload to Google Drive</h3>
                <p>Upload converted text files to Google Drive</p>
              </div>
            </motion.button>

            {/* Delete Button */}
            <motion.button
              className="action-btn delete-btn enabled"
              onClick={handleDelete}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              data-aos="zoom-in"
              data-aos-delay="500"
            >
              <motion.span
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
                className="action-icon"
              >
                🗑️
              </motion.span>
              <div>
                <h3>Delete Project</h3>
                <p>Permanently delete this project</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Project Progress */}
      {(['scanning', 'converting', 'uploading_to_drive'].includes(project.status)) && (
        <motion.div 
          className="progress-section" 
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-aos="fade-up"
        >
          <motion.div className="section-card">
            <h2>⚡ Operation in Progress</h2>
            <motion.div 
              className="progress-indicator"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="progress-text">
                {project.status === 'scanning' && '🔍 Scanning project files...'}
                {project.status === 'converting' && '⚡ Converting code to text...'}
                {project.status === 'uploading_to_drive' && '☁️ Uploading to Google Drive...'}
              </div>
              <motion.div 
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {showGoogleDriveModal && (
        <GoogleDriveUpload
          projectId={id}
          onUploadComplete={handleGoogleDriveUploadComplete}
          onClose={() => setShowGoogleDriveModal(false)}
        />
      )}
    </motion.div>
  );
};

export default ProjectDetail; 