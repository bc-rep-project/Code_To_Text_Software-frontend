import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';

import Header from './Header';
import Sidebar from './Sidebar';
import { toggleSidebar, toggleMobileDrawer } from '../../store/slices/uiSlice';

const Layout = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { sidebarOpen, mobileDrawerOpen } = useSelector(state => state.ui);
  
  const handleToggleSidebar = () => {
    if (isMobile) {
      dispatch(toggleMobileDrawer());
    } else {
      dispatch(toggleSidebar());
    }
  };
  
  const drawerWidth = 240;
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* App Header */}
      <Header 
        drawerWidth={drawerWidth} 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={handleToggleSidebar}
      />
      
      {/* Sidebar for navigation */}
      <Sidebar 
        drawerWidth={drawerWidth} 
        sidebarOpen={sidebarOpen}
        mobileOpen={mobileDrawerOpen}
        onToggleSidebar={handleToggleSidebar}
        isMobile={isMobile}
      />
      
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px', // Header height
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 