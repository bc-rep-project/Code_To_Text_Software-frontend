import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Initialize PayPal with configuration options
const PayPalProvider = ({ children }) => {
  // Get PayPal client ID from environment variable
  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test';
  
  // PayPal initialization options
  const initialOptions = {
    'client-id': paypalClientId,
    currency: 'USD',
    intent: 'subscription',
    'data-client-token': 'abc123xyz', // Replace with actual client token if needed
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider; 