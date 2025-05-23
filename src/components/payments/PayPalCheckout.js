import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Divider
} from '@mui/material';
import PayPalButton from './PayPalButton';

const PayPalCheckout = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upgrade to Premium
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" gutterBottom>
          Premium Plan - $9.99/month
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Unlock all features and get unlimited access to our advanced code-to-text conversion tools.
        </Typography>
        <Box sx={{ my: 1 }}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            ✓ <Box component="span" sx={{ ml: 1 }}>Unlimited conversions</Box>
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            ✓ <Box component="span" sx={{ ml: 1 }}>Advanced formatting options</Box>
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            ✓ <Box component="span" sx={{ ml: 1 }}>Priority support</Box>
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            ✓ <Box component="span" sx={{ ml: 1 }}>Batch processing</Box>
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Payment Method
        </Typography>
        
        <PayPalButton 
          onSuccess={(data) => {
            if (onSuccess) {
              onSuccess(data);
            }
          }}
          onError={() => setLoading(false)}
        />
      </Box>
    </Paper>
  );
};

export default PayPalCheckout;
