import apiClient from '../config/api';

export const projectService = {
  // Get all projects
  getProjects: async () => {
    try {
      const response = await apiClient.get('/projects/');
      return {
        success: true,
        projects: response.data.projects || [],
        totalCount: response.data.total_count || 0
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        projects: []
      };
    }
  },

  // Get project details
  getProject: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/`);
      return {
        success: true,
        project: response.data.project
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      // Map frontend field names to backend field names
      const backendData = {
        project_name: projectData.name,
        source_type: projectData.source_type || 'upload', // Default to upload if not specified
        description: projectData.description, // Include if provided (even though backend doesn't use it yet)
      };
      
      // Add github_repo_url if it's a github project
      if (projectData.source_type === 'github' && projectData.github_repo_url) {
        backendData.github_repo_url = projectData.github_repo_url;
      }
      
      const response = await apiClient.post('/projects/', backendData);
      return {
        success: true,
        project: response.data.project,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Upload code files to project
  uploadCode: async (projectId, files) => {
    try {
      const formData = new FormData();
      
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await apiClient.post(`/projects/${projectId}/upload_code/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Scan project
  scanProject: async (projectId) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/scan/`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Convert project
  convertProject: async (projectId, options = {}) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/convert/`, options);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Download project results
  downloadProject: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/download/`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-${projectId}-results.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Download started'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Upload to Google Drive with proper AllAuth integration
  uploadToGoogleDrive: async (projectId, params = {}) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/upload_to_drive/`, params);
      
      console.log('Google Drive Upload Response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message,
        status: response.data.status || 'success',
        driveLink: response.data.drive_folder_link,
        driveFolderId: response.data.drive_folder_id,
        // For OAuth flow
        actionRequired: response.data.action_required,
        authUrl: response.data.auth_url
      };
    } catch (error) {
      console.error('Google Drive Upload Error:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message,
        status: 'error'
      };
    }
  },

  // Simplified Google Drive OAuth helper
  initiateGoogleAuth: (authUrl) => {
    // Open Google OAuth in a new window/tab
    window.open(authUrl, '_blank', 'width=500,height=600');
  },

  // Google Drive OAuth Flow Steps
  googleDriveFlow: {
    // Step 1: Initialize OAuth flow
    initiate: async (projectId) => {
      return projectService.uploadToGoogleDrive(projectId);
    },

    // Step 2: Submit email for verification
    submitEmail: async (projectId, googleEmail) => {
      return projectService.uploadToGoogleDrive(projectId, { google_email: googleEmail });
    },

    // Step 3: Submit verification code
    submitVerificationCode: async (projectId, googleEmail, verificationCode) => {
      return projectService.uploadToGoogleDrive(projectId, {
        google_email: googleEmail,
        verification_code: verificationCode
      });
    },

    // Step 4: Submit OAuth tokens
    submitOAuthTokens: async (projectId, accessToken, refreshToken = null) => {
      return projectService.uploadToGoogleDrive(projectId, {
        google_access_token: accessToken,
        google_refresh_token: refreshToken
      });
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      await apiClient.delete(`/projects/${projectId}/`);
      return {
        success: true,
        message: 'Project deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
};

export default projectService; 