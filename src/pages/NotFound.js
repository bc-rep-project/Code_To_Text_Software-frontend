import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3
      }}
    >
      <Paper 
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500
        }}
      >
        <Typography variant="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
