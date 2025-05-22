import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" component="h1" gutterBottom>
              Code2Text
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
              Convert your code repositories to text files with ease
            </Typography>
            <Typography variant="body1" paragraph>
              A powerful tool for analyzing GitHub repositories and converting code to text format while preserving the directory structure.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button 
                component={Link} 
                to="/register" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ mr: 2 }}
              >
                Get Started
              </Button>
              <Button 
                component={Link} 
                to="/login" 
                variant="outlined" 
                color="primary" 
                size="large"
              >
                Log In
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">
                Welcome to Code2Text
              </Typography>
              <Typography variant="body1">
                Placeholder for landing page illustration or screenshot
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
