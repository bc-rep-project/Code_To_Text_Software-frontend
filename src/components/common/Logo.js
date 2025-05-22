import React from 'react';
import { Box, Typography } from '@mui/material';
import { Transform as TransformIcon } from '@mui/icons-material';

// Logo component with size variations
const Logo = ({ size = 'medium', color = 'primary' }) => {
  // Determine the sizes based on the size prop
  let iconSize;
  let fontSize;
  
  switch (size) {
    case 'small':
      iconSize = 24;
      fontSize = '1.25rem';
      break;
    case 'large':
      iconSize = 40;
      fontSize = '2rem';
      break;
    case 'medium':
    default:
      iconSize = 32;
      fontSize = '1.5rem';
      break;
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TransformIcon 
        sx={{ 
          fontSize: iconSize, 
          mr: 1, 
          color: color === 'white' ? 'white' : `${color}.main`
        }} 
      />
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          fontSize,
          fontWeight: 'bold',
          color: color === 'white' ? 'white' : `text.primary`
        }}
      >
        Code2Text
      </Typography>
    </Box>
  );
};

export default Logo; 