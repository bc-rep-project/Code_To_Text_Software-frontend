import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Initialize PayPal with configuration options
const PayPalProvider = ({ children }) => {
  // Get PayPal client ID from environment variable
  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  
  // Don't initialize PayPal if client ID is missing or set to 'test'
  if (!paypalClientId || paypalClientId === 'test') {
    console.warn('PayPal Client ID is not configured properly. PayPal functionality will be disabled.');
    return children;
  }
  
  // PayPal initialization options
  const initialOptions = {
    'client-id': paypalClientId,
    currency: 'USD',
    intent: 'subscription',
    // Remove the data-client-token as it's not needed for basic setup
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};

export default PayPalProvider; 