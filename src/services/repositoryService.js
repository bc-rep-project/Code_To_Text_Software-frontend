import api from './apiConfig';

const repositoryService = {
  // Get all repositories for the current user
  getRepositories: async () => {
    const response = await api.get('/repositories/');
    return response.data;
  },
  
  // Get details of a specific repository
  getRepositoryDetails: async (repositoryId) => {
    const response = await api.get(`/repositories/${repositoryId}/`);
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
      
      const response = await api.post('/repositories/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // For GitHub URL
      const response = await api.post('/repositories/', repositoryData);
      return response.data;
    }
  },
  
  // Update repository metadata
  updateRepository: async (repositoryId, updateData) => {
    const response = await api.patch(`/repositories/${repositoryId}/`, updateData);
    return response.data;
  },
  
  // Delete a repository
  deleteRepository: async (repositoryId) => {
    await api.delete(`/repositories/${repositoryId}/`);
    return true;
  },
  
  // Start repository analysis
  analyzeRepository: async (repositoryId, analysisOptions = {}) => {
    const response = await api.post(`/repositories/${repositoryId}/analyze/`, analysisOptions);
    return response.data;
  },
  
  // Get analysis results
  getAnalysisResults: async (analysisId) => {
    const response = await api.get(`/analyses/${analysisId}/`);
    return response.data;
  },
  
  // List all analyses for a repository
  getRepositoryAnalyses: async (repositoryId) => {
    const response = await api.get(`/repositories/${repositoryId}/analyses/`);
    return response.data;
  },
  
  // Cancel an ongoing analysis
  cancelAnalysis: async (analysisId) => {
    const response = await api.post(`/analyses/${analysisId}/cancel/`);
    return response.data;
  },
  
  // Check GitHub repository structure (before adding)
  checkGitHubRepository: async (githubUrl) => {
    const response = await api.post('/repositories/check-github/', { url: githubUrl });
    return response.data;
  },
  
  // Sync a GitHub repository (update from remote)
  syncRepository: async (repositoryId) => {
    const response = await api.post(`/repositories/${repositoryId}/sync/`);
    return response.data;
  }
};

export default repositoryService; 