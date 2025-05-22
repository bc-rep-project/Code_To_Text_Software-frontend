import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', 'success'
  },
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,
  selectedTab: 0,
  mobileDrawerOpen: false,
  searchQuery: '',
  filterOptions: {
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Snackbar
    openSnackbar: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.severity = action.payload.severity || 'info';
    },
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
    
    // Dark mode
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    // Tab selection
    setSelectedTab: (state, action) => {
      state.selectedTab = action.payload;
    },
    
    // Mobile drawer
    toggleMobileDrawer: (state) => {
      state.mobileDrawerOpen = !state.mobileDrawerOpen;
    },
    
    // Search and filters
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterOptions: (state, action) => {
      state.filterOptions = {
        ...state.filterOptions,
        ...action.payload
      };
    },
    resetFilterOptions: (state) => {
      state.filterOptions = initialState.filterOptions;
    }
  }
});

export const {
  openSnackbar,
  closeSnackbar,
  toggleDarkMode,
  toggleSidebar,
  setSelectedTab,
  toggleMobileDrawer,
  setSearchQuery,
  setFilterOptions,
  resetFilterOptions
} = uiSlice.actions;

export default uiSlice.reducer; 