import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Logo from '../common/Logo';

const AuthLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default
      }}
    >
      {/* Header with logo */}
      <Box
        component="header"
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={isMobile ? 'small' : 'medium'} />
        </Link>
      </Box>

      {/* Main content */}
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Outlet />
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          p: 2,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Code2Text. All rights reserved.
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Link
            to="/privacy"
            style={{
              color: theme.palette.text.secondary,
              marginRight: theme.spacing(2),
              textDecoration: 'none'
            }}
          >
            <Typography variant="body2" display="inline">
              Privacy Policy
            </Typography>
          </Link>
          <Link
            to="/terms"
            style={{
              color: theme.palette.text.secondary,
              textDecoration: 'none'
            }}
          >
            <Typography variant="body2" display="inline">
              Terms of Service
            </Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout; 