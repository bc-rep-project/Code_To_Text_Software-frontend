import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import conversionService from '../../services/conversionService';

// Async thunks
export const startConversion = createAsyncThunk(
  'conversion/startConversion',
  async ({repositoryId, conversionOptions}, { rejectWithValue }) => {
    try {
      return await conversionService.startConversion(repositoryId, conversionOptions);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchConversions = createAsyncThunk(
  'conversion/fetchConversions',
  async (_, { rejectWithValue }) => {
    try {
      return await conversionService.getConversions();
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchConversionDetails = createAsyncThunk(
  'conversion/fetchConversionDetails',
  async (conversionId, { rejectWithValue }) => {
    try {
      return await conversionService.getConversionDetails(conversionId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const downloadConversion = createAsyncThunk(
  'conversion/downloadConversion',
  async (conversionId, { rejectWithValue }) => {
    try {
      return await conversionService.downloadConversion(conversionId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const saveToGoogleDrive = createAsyncThunk(
  'conversion/saveToGoogleDrive',
  async ({conversionId, driveOptions}, { rejectWithValue }) => {
    try {
      return await conversionService.saveToGoogleDrive(conversionId, driveOptions);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const cancelConversion = createAsyncThunk(
  'conversion/cancelConversion',
  async (conversionId, { rejectWithValue }) => {
    try {
      await conversionService.cancelConversion(conversionId);
      return conversionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const deleteConversion = createAsyncThunk(
  'conversion/deleteConversion',
  async (conversionId, { rejectWithValue }) => {
    try {
      await conversionService.deleteConversion(conversionId);
      return conversionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const initialState = {
  conversions: [],
  currentConversion: null,
  conversionInProgress: false,
  isLoading: false,
  downloadProgress: 0,
  error: null,
};

const conversionSlice = createSlice({
  name: 'conversion',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversion: (state, action) => {
      state.currentConversion = action.payload;
    },
    updateDownloadProgress: (state, action) => {
      state.downloadProgress = action.payload;
    },
    resetDownloadProgress: (state) => {
      state.downloadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Conversion
      .addCase(startConversion.pending, (state) => {
        state.conversionInProgress = true;
        state.error = null;
      })
      .addCase(startConversion.fulfilled, (state, action) => {
        state.conversionInProgress = false;
        state.conversions.push(action.payload);
        state.currentConversion = action.payload;
      })
      .addCase(startConversion.rejected, (state, action) => {
        state.conversionInProgress = false;
        state.error = action.payload || { error: 'Failed to start conversion' };
      })
      
      // Fetch Conversions
      .addCase(fetchConversions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversions = action.payload;
      })
      .addCase(fetchConversions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to fetch conversions' };
      })
      
      // Fetch Conversion Details
      .addCase(fetchConversionDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversion = action.payload;
      })
      .addCase(fetchConversionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to fetch conversion details' };
      })
      
      // Download Conversion
      .addCase(downloadConversion.pending, (state) => {
        state.isLoading = true;
        state.downloadProgress = 0;
        state.error = null;
      })
      .addCase(downloadConversion.fulfilled, (state) => {
        state.isLoading = false;
        state.downloadProgress = 100;
      })
      .addCase(downloadConversion.rejected, (state, action) => {
        state.isLoading = false;
        state.downloadProgress = 0;
        state.error = action.payload || { error: 'Failed to download conversion' };
      })
      
      // Save to Google Drive
      .addCase(saveToGoogleDrive.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveToGoogleDrive.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentConversion) {
          state.currentConversion = {
            ...state.currentConversion,
            googleDriveUrl: action.payload.driveUrl,
            savedToGoogleDrive: true
          };
        }
      })
      .addCase(saveToGoogleDrive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to save to Google Drive' };
      })
      
      // Cancel Conversion
      .addCase(cancelConversion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelConversion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversionInProgress = false;
        
        // Update the status of the canceled conversion
        const index = state.conversions.findIndex(conv => conv.id === action.payload);
        if (index !== -1) {
          state.conversions[index] = {
            ...state.conversions[index],
            status: 'cancelled'
          };
        }
        
        if (state.currentConversion && state.currentConversion.id === action.payload) {
          state.currentConversion = {
            ...state.currentConversion,
            status: 'cancelled'
          };
        }
      })
      .addCase(cancelConversion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to cancel conversion' };
      })
      
      // Delete Conversion
      .addCase(deleteConversion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteConversion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversions = state.conversions.filter(conv => conv.id !== action.payload);
        if (state.currentConversion && state.currentConversion.id === action.payload) {
          state.currentConversion = null;
        }
      })
      .addCase(deleteConversion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to delete conversion' };
      });
  },
});

export const { 
  clearError, 
  setCurrentConversion, 
  updateDownloadProgress, 
  resetDownloadProgress 
} = conversionSlice.actions;

export default conversionSlice.reducer; 