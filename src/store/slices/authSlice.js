import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (authCode, { rejectWithValue }) => {
    try {
      return await authService.googleAuth(authCode);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getUserDetails();
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const getUserDetails = createAsyncThunk(
  'auth/getUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getUserDetails();
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const startTrial = createAsyncThunk(
  'auth/startTrial',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.startTrial();
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const subscribe = createAsyncThunk(
  'auth/subscribe',
  async (paymentToken, { rejectWithValue }) => {
    try {
      return await authService.subscribe(paymentToken);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(profileData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      return await authService.changePassword(passwordData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      return await authService.confirmPasswordReset(resetData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await authService.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

// Get token from local storage
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

const initialState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Authentication failed' };
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Registration failed' };
      })
      
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Google authentication failed' };
      })
      
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to fetch user profile' };
      })
      
      // Get User Details
      .addCase(getUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to get user details' };
      })
      
      // Start Trial
      .addCase(startTrial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTrial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(startTrial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to start trial' };
      })
      
      // Subscribe
      .addCase(subscribe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(subscribe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(subscribe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Subscription failed' };
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Logout failed' };
      })
      
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to update profile' };
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to change password' };
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to request password reset' };
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to reset password' };
      })
      
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { error: 'Failed to delete account' };
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 