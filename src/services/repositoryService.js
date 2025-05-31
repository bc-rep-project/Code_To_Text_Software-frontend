import api from './apiConfig';

const repositoryService = {
  // Get all repositories for the current user
  getRepositories: async () => {
    const response = await api.get('/projects/');
    return response.data;
  },
  
  // Get details of a specific repository
  getRepositoryDetails: async (repositoryId) => {
    const response = await api.get(`/projects/${repositoryId}/`);
    return response.data;
  },
  
  // Add a new repository (GitHub URL or manual upload)
  addRepository: async (repositoryData) => {
    // Handle file upload differently than regular JSON data
    if (repositoryData.file) {
      const formData = new FormData();
      formData.append('file', repositoryData.file);
      formData.append('name', repositoryData.name);
      formData.append('description', repositoryData.description || '');
      
      const response = await api.post(`/projects/${repositoryData.project_id}/upload_code/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // For GitHub URL or new project creation
      const response = await api.post('/projects/', repositoryData);
      return response.data;
    }
  },
  
  // Update repository metadata
  updateRepository: async (repositoryId, updateData) => {
    const response = await api.patch(`/projects/${repositoryId}/`, updateData);
    return response.data;
  },
  
  // Delete a repository
  deleteRepository: async (repositoryId) => {
    await api.delete(`/projects/${repositoryId}/`);
    return true;
  },
  
  // Start repository analysis (scan)
  analyzeRepository: async (repositoryId, analysisOptions = {}) => {
    const response = await api.post(`/projects/${repositoryId}/scan/`, analysisOptions);
    return response.data;
  },
  
  // Get analysis results - this might need to be adjusted based on backend implementation
  getAnalysisResults: async (analysisId) => {
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.get(`/analyses/${analysisId}/`);
    return response.data;
  },
  
  // List all analyses for a repository - this might need to be adjusted
  getRepositoryAnalyses: async (repositoryId) => {
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.get(`/projects/${repositoryId}/analyses/`);
    return response.data;
  },
  
  // Cancel an ongoing analysis - this might need to be adjusted
  cancelAnalysis: async (analysisId) => {
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.post(`/analyses/${analysisId}/cancel/`);
    return response.data;
  },
  
  // Check GitHub repository structure (before adding) - might need backend implementation
  checkGitHubRepository: async (githubUrl) => {
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.post('/projects/check-github/', { url: githubUrl });
    return response.data;
  },
  
  // Sync a GitHub repository (update from remote) - might need backend implementation
  syncRepository: async (repositoryId) => {
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.post(`/projects/${repositoryId}/sync/`);
    return response.data;
  }
};

export default repositoryService; 