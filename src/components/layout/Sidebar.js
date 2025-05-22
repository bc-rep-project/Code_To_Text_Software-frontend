import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as RepositoryIcon,
  Transform as ConversionIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const Sidebar = ({ 
  drawerWidth, 
  sidebarOpen, 
  mobileOpen, 
  onToggleSidebar, 
  isMobile 
}) => {
  const theme = useTheme();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Repositories',
      icon: <RepositoryIcon />,
      path: '/repositories'
    },
    {
      text: 'Conversions',
      icon: <ConversionIcon />,
      path: '/conversions'
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings'
    }
  ];
  
  const drawerContent = (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: theme.spacing(0, 1),
        minHeight: 64
      }}>
        <Box component={Link} to="/" sx={{ 
          display: 'flex',
          alignItems: 'center', 
          textDecoration: 'none',
          color: 'inherit',
          px: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ConversionIcon sx={{ mr: 1 }} />
            <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
              Code2Text
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onToggleSidebar}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${theme.palette.primary.main}20`, // 20% opacity of primary color
                  '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}30`, // 30% opacity of primary color
                  },
                },
                borderRadius: '0 24px 24px 0',
                mx: 1,
                my: 0.5
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive(item.path) ? theme.palette.primary.main : 'inherit',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
  
  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onToggleSidebar}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: theme.palette.divider,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            whiteSpace: 'nowrap',
            overflowX: 'hidden',
            ...(sidebarOpen ? {
              width: drawerWidth,
            } : {
              width: theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
              },
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar; 