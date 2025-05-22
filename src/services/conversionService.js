import api from './apiConfig';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const conversionService = {
  // Get all conversions for the current user
  getConversions: async () => {
    const response = await api.get('/conversions/');
    return response.data;
  },
  
  // Get details of a specific conversion
  getConversionDetails: async (conversionId) => {
    const response = await api.get(`/conversions/${conversionId}/`);
    return response.data;
  },
  
  // Start a new conversion
  startConversion: async (repositoryId, conversionOptions = {}) => {
    const response = await api.post(`/repositories/${repositoryId}/convert/`, conversionOptions);
    return response.data;
  },
  
  // Cancel a conversion in progress
  cancelConversion: async (conversionId) => {
    const response = await api.post(`/conversions/${conversionId}/cancel/`);
    return response.data;
  },
  
  // Delete a conversion
  deleteConversion: async (conversionId) => {
    await api.delete(`/conversions/${conversionId}/`);
    return true;
  },
  
  // Download conversion results
  downloadConversion: async (conversionId) => {
    try {
      // Get conversion metadata first to determine format and filename
      const metadata = await api.get(`/conversions/${conversionId}/`);
      const conversionName = metadata.data.name || `code2text-conversion-${conversionId}`;
      
      // Download the actual content
      const response = await api.get(`/conversions/${conversionId}/download/`, {
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
    const response = await api.post(`/conversions/${conversionId}/google-drive/`, driveOptions);
    return response.data;
  },
  
  // Get conversion progress
  getConversionProgress: async (conversionId) => {
    const response = await api.get(`/conversions/${conversionId}/progress/`);
    return response.data;
  },
  
  // Custom conversion (specific files or directories)
  customConversion: async (repositoryId, fileSelection, conversionOptions = {}) => {
    const payload = {
      ...conversionOptions,
      files: fileSelection
    };
    const response = await api.post(`/repositories/${repositoryId}/convert/custom/`, payload);
    return response.data;
  },
  
  // Check if user has remaining conversions in their plan
  checkRemainingConversions: async () => {
    const response = await api.get('/auth/subscription/usage/');
    return response.data;
  }
};

export default conversionService; 