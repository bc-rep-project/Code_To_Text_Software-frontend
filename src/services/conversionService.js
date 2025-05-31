import api from './apiConfig';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const conversionService = {
  // Get all conversions for the current user - using projects endpoint
  getConversions: async () => {
    // Since there's no separate conversions endpoint, we'll get projects and filter converted ones
    const response = await api.get('/projects/');
    return response.data;
  },
  
  // Get details of a specific conversion - using project detail endpoint
  getConversionDetails: async (conversionId) => {
    const response = await api.get(`/projects/${conversionId}/`);
    return response.data;
  },
  
  // Start a new conversion
  startConversion: async (repositoryId, conversionOptions = {}) => {
    const response = await api.post(`/projects/${repositoryId}/convert/`, conversionOptions);
    return response.data;
  },
  
  // Cancel a conversion in progress - this might not be implemented yet
  cancelConversion: async (conversionId) => {
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.post(`/projects/${conversionId}/cancel/`);
    return response.data;
  },
  
  // Delete a conversion - using project delete
  deleteConversion: async (conversionId) => {
    await api.delete(`/projects/${conversionId}/`);
    return true;
  },
  
  // Download conversion results
  downloadConversion: async (conversionId) => {
    try {
      // Get conversion metadata first to determine format and filename
      const metadata = await api.get(`/projects/${conversionId}/`);
      const conversionName = metadata.data.project_name || `code2text-conversion-${conversionId}`;
      
      // Download the actual content
      const response = await api.get(`/projects/${conversionId}/download/`, {
        responseType: 'blob'
      });
      
      // Determine if this is a single file or multiple files
      if (metadata.data.format === 'zip' || metadata.data.output_type === 'multiple') {
        // If it's a ZIP file, save directly
        saveAs(new Blob([response.data]), `${conversionName}.zip`);
      } else if (metadata.data.format === 'json') {
        saveAs(new Blob([response.data], { type: 'application/json' }), `${conversionName}.json`);
      } else {
        // If it's a single text file
        saveAs(new Blob([response.data], { type: 'text/plain' }), `${conversionName}.txt`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },
  
  // Save conversion to Google Drive
  saveToGoogleDrive: async (conversionId, driveOptions = {}) => {
    const response = await api.post(`/projects/${conversionId}/upload_to_drive/`, driveOptions);
    return response.data;
  },
  
  // Get conversion progress - this might not be implemented yet
  getConversionProgress: async (conversionId) => {
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.get(`/projects/${conversionId}/progress/`);
    return response.data;
  },
  
  // Custom conversion (specific files or directories) - this might not be implemented yet
  customConversion: async (repositoryId, fileSelection, conversionOptions = {}) => {
    const payload = {
      ...conversionOptions,
      files: fileSelection
    };
    // This endpoint might not exist yet in backend, keeping for compatibility
    const response = await api.post(`/projects/${repositoryId}/convert/custom/`, payload);
    return response.data;
  },
  
  // Check if user has remaining conversions in their plan
  checkRemainingConversions: async () => {
    const response = await api.get('/auth/subscription/usage/');
    return response.data;
  }
};

export default conversionService; 