import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  Link,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent
} from '@mui/material';

import { forgotPassword } from '../../store/slices/authSlice';
import Logo from '../../components/common/Logo';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { isLoading, error } = useSelector(state => state.auth);
  
  // Local state
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  
  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(forgotPassword(values))
      .unwrap()
      .then(() => {
        setEmailSent(true);
        setEmail(values.email);
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          borderRadius: 2,
          boxShadow: 4
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Logo size="large" />
            <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {emailSent 
                ? 'Password reset link sent! Check your inbox.' 
                : 'Enter your email and we\'ll send you a reset link'}
            </Typography>
          </Box>
          
          {emailSent ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
              </Alert>
              
              <Typography variant="body2" paragraph>
                Didn't receive the email? Check your spam folder or try these steps:
              </Typography>
              
              <ul>
                <li>
                  <Typography variant="body2">
                    Make sure the email address is correct
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Wait a few minutes for the email to arrive
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Check your spam or junk folder
                  </Typography>
                </li>
              </ul>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                >
                  Back to Login
                </Button>
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="contained"
                >
                  Try Again
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error.message || 'Failed to send reset link. Please try again.'}
                </Alert>
              )}
              
              <Formik
                initialValues={{ email: '' }}
                validationSchema={ForgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Box sx={{ mb: 3 }}>
                      <Field
                        as={TextField}
                        name="email"
                        label="Email Address"
                        fullWidth
                        variant="outlined"
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                        autoComplete="email"
                        disabled={isLoading}
                        sx={{ mb: 2 }}
                      />
                    </Box>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      disabled={isLoading || isSubmitting}
                      sx={{ mb: 2 }}
                    >
                      {isLoading || isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : 'Send Reset Link'}
                    </Button>
                    
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Remember your password?{' '}
                        <Link 
                          component={RouterLink} 
                          to="/login" 
                          color="primary"
                        >
                          Back to login
                        </Link>
                      </Typography>
                    </Box>
                  </Form>
                )}
              </Formik>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword; 