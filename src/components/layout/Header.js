import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { logout } from '../../store/slices/authSlice';
import { openSnackbar } from '../../store/slices/uiSlice';

const Header = ({ drawerWidth, sidebarOpen, onToggleSidebar }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector(state => state.auth);
  
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleCloseMenu();
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
      dispatch(openSnackbar({ 
        message: 'You have been successfully logged out', 
        severity: 'success' 
      }));
    } catch (error) {
      dispatch(openSnackbar({ 
        message: 'Failed to log out. Please try again.', 
        severity: 'error' 
      }));
    }
  };
  
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
        ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: { xs: 'block', md: sidebarOpen ? 'none' : 'block' } }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" noWrap component="div">
              Code2Text
            </Typography>
          </Link>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* User menu */}
        <Box>
          <IconButton
            onClick={handleMenu}
            size="large"
            color="inherit"
            aria-controls="menu-appbar"
            aria-haspopup="true"
          >
            {user?.avatar ? (
              <Avatar 
                alt={user.name || user.username} 
                src={user.avatar} 
              />
            ) : (
              <AccountCircleIcon />
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => {
              handleCloseMenu();
              navigate('/profile');
            }}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseMenu();
              navigate('/settings');
            }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 