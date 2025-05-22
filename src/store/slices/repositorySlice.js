import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import repositoryService from '../../services/repositoryService';

// Async thunks
export const fetchRepositories = createAsyncThunk(
  'repository/fetchRepositories',
  async (_, { rejectWithValue }) => {
    try {
      return await repositoryService.getRepositories();
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchRepositoryDetails = createAsyncThunk(
  'repository/fetchRepositoryDetails',
  async (repositoryId, { rejectWithValue }) => {
    try {
      return await repositoryService.getRepositoryDetails(repositoryId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const addRepository = createAsyncThunk(
  'repository/addRepository',
  async (repositoryData, { rejectWithValue }) => {
    try {
      return await repositoryService.addRepository(repositoryData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const analyzeRepository = createAsyncThunk(
  'repository/analyzeRepository',
  async ({repositoryId, analysisOptions}, { rejectWithValue }) => {
    try {
      return await repositoryService.analyzeRepository(repositoryId, analysisOptions);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchAnalysisResults = createAsyncThunk(
  'repository/fetchAnalysisResults',
  async (analysisId, { rejectWithValue }) => {
    try {
      return await repositoryService.getAnalysisResults(analysisId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const deleteRepository = createAsyncThunk(
  'repository/deleteRepository',
  async (repositoryId, { rejectWithValue }) => {
    try {
      await repositoryService.deleteRepository(repositoryId);
      return repositoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const syncRepository = createAsyncThunk(
  'repository/syncRepository',
  async (repositoryId, { rejectWithValue }) => {
    try {
      return await repositoryService.syncRepository(repositoryId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

const initialState = {
  repositories: [],
  currentRepository: null,
  analysisResults: null,
  isLoading: false,
  analysisInProgress: false,
  error: null,
};

const repositorySlice = createSlice({
  name: 'repository',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRepository: (state, action) => {
      state.currentRepository = action.payload;
    },
    clearAnalysisResults: (state) => {
      state.analysisResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Repositories
      .addCase(fetchRepositories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repositories = action.payload;
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to fetch repositories' };
      })
      
      // Fetch Repository Details
      .addCase(fetchRepositoryDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRepositoryDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRepository = action.payload;
      })
      .addCase(fetchRepositoryDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to fetch repository details' };
      })
      
      // Add Repository
      .addCase(addRepository.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addRepository.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repositories.push(action.payload);
      })
      .addCase(addRepository.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to add repository' };
      })
      
      // Analyze Repository
      .addCase(analyzeRepository.pending, (state) => {
        state.analysisInProgress = true;
        state.error = null;
      })
      .addCase(analyzeRepository.fulfilled, (state, action) => {
        state.analysisInProgress = false;
        // The response might include the analysis ID or status
        if (state.currentRepository && action.payload.repositoryId === state.currentRepository.id) {
          state.currentRepository = {
            ...state.currentRepository,
            analysisStatus: action.payload.status,
            lastAnalysisId: action.payload.analysisId
          };
        }
      })
      .addCase(analyzeRepository.rejected, (state, action) => {
        state.analysisInProgress = false;
        state.error = action.payload || { error: 'Failed to analyze repository' };
      })
      
      // Fetch Analysis Results
      .addCase(fetchAnalysisResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalysisResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analysisResults = action.payload;
      })
      .addCase(fetchAnalysisResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to fetch analysis results' };
      })
      
      // Delete Repository
      .addCase(deleteRepository.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRepository.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repositories = state.repositories.filter(repo => repo.id !== action.payload);
        if (state.currentRepository && state.currentRepository.id === action.payload) {
          state.currentRepository = null;
        }
      })
      .addCase(deleteRepository.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to delete repository' };
      })
      
      // Sync Repository
      .addCase(syncRepository.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncRepository.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the current repository with the synced data
        if (state.currentRepository && action.payload && action.payload.id === state.currentRepository.id) {
          state.currentRepository = action.payload;
        }
        // Update the repository in the repositories array
        const index = state.repositories.findIndex(repo => repo.id === action.payload.id);
        if (index !== -1) {
          state.repositories[index] = action.payload;
        }
      })
      .addCase(syncRepository.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to sync repository' };
      });
  },
});

export const { clearError, setCurrentRepository, clearAnalysisResults } = repositorySlice.actions;
export default repositorySlice.reducer; 