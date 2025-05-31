import React from 'react';
import { useDispatch } from 'react-redux';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Box, Typography, Alert } from '@mui/material';
import { subscribe } from '../../store/slices/authSlice';
import { openSnackbar } from '../../store/slices/uiSlice';

const PayPalButton = ({ onSuccess, onError }) => {
  const dispatch = useDispatch();
  
  // Get PayPal client ID from environment variables
  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  
  // Show message if PayPal is not configured
  if (!paypalClientId || paypalClientId === 'test') {
    return (
      <Box sx={{ width: '100%', my: 2 }}>
        <Alert severity="warning">
          PayPal payments are not configured. Please contact support for payment options.
        </Alert>
      </Box>
    );
  }
  
  // Handle successful payment
  const handleApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      // Extract payment token from the transaction
      const paymentToken = details.id;
      
      // Process subscription with the backend
      dispatch(subscribe(paymentToken))
        .unwrap()
        .then((response) => {
          dispatch(openSnackbar({
            message: 'Subscription successful!',
            severity: 'success'
          }));
          
          if (onSuccess) {
            onSuccess(response);
          }
        })
        .catch((error) => {
          dispatch(openSnackbar({
            message: `Subscription failed: ${error.message || 'Unknown error'}`,
            severity: 'error'
          }));
          
          if (onError) {
            onError(error);
          }
        });
    });
  };
  
  // Handle payment error
  const handleError = (err) => {
    dispatch(openSnackbar({
      message: `Payment error: ${err.message || 'Unknown error'}`,
      severity: 'error'
    }));
    
    if (onError) {
      onError(err);
    }
  };
  
  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <PayPalScriptProvider options={{ 
        "client-id": paypalClientId,
        currency: "USD"
      }}>
        <PayPalButtons
          style={{ 
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "subscribe"
          }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: "Code2Text Monthly Subscription",
                  amount: {
                    currency_code: "USD",
                    value: "9.99"
                  }
                }
              ],
              application_context: {
                shipping_preference: "NO_SHIPPING"
              }
            });
          }}
          onApprove={handleApprove}
          onError={handleError}
          onCancel={() => {
            dispatch(openSnackbar({
              message: 'Payment cancelled',
              severity: 'info'
            }));
          }}
        />
      </PayPalScriptProvider>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </Typography>
    </Box>
  );
};

export default PayPalButton; 