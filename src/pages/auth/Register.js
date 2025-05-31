import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  GitHub as GitHubIcon,
  Google as GoogleIcon
} from '@mui/icons-material';

import { register, googleAuth } from '../../store/slices/authSlice';
import { openSnackbar } from '../../store/slices/uiSlice';
import Logo from '../../components/common/Logo';

// Validation schema
const RegisterSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  accept_terms: Yup.bool()
    .oneOf([true], 'You must accept the terms and conditions')
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { isLoading, error } = useSelector(state => state.auth);
  
  // Local state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Handle password visibility toggle
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    const { confirmPassword, accept_terms, ...userData } = values;
    
    // Add password_confirm field for backend validation
    userData.password_confirm = confirmPassword;
    
    dispatch(register(userData))
      .unwrap()
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        setSubmitting(false);
      });
  };
  
  // Handle OAuth signup
  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth flow properly
    // For now, show a message that it's not available
    dispatch(openSnackbar({
      message: 'Google signup is coming soon. Please use email/password registration.',
      severity: 'info'
    }));
  };
  
  const handleGitHubSignup = () => {
    // Comment out GitHub signup since it's not implemented yet
    /*
    dispatch(loginWithGitHub())
      .unwrap()
      .then(() => {
        navigate('/');
      })
      .catch(() => {});
    */
    // Display an alert that GitHub signup is not yet available
    dispatch(openSnackbar({
      message: 'GitHub signup is not available yet',
      severity: 'info'
    }));
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
          maxWidth: 550,
          width: '100%',
          borderRadius: 2,
          boxShadow: 4
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Logo size="large" />
            <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
              Create an account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join Code2Text to convert your code into natural language
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error.message || 'Registration failed. Please try again.'}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  Sign up with Google
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  onClick={handleGitHubSignup}
                  disabled={isLoading}
                >
                  Sign up with GitHub
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Formik
            initialValues={{ 
              first_name: '', 
              last_name: '', 
              email: '', 
              password: '', 
              confirmPassword: '',
              accept_terms: false
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="first_name"
                      label="First Name"
                      fullWidth
                      variant="outlined"
                      error={Boolean(touched.first_name && errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                      disabled={isLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="last_name"
                      label="Last Name"
                      fullWidth
                      variant="outlined"
                      error={Boolean(touched.last_name && errors.last_name)}
                      helperText={touched.last_name && errors.last_name}
                      disabled={isLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
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
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="password"
                      label="Password"
                      fullWidth
                      variant="outlined"
                      error={Boolean(touched.password && errors.password)}
                      helperText={touched.password && errors.password}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isLoading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="confirmPassword"
                      label="Confirm Password"
                      fullWidth
                      variant="outlined"
                      error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isLoading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Field
                          as={Checkbox}
                          name="accept_terms"
                          color="primary"
                          disabled={isLoading}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the{' '}
                          <Link component={RouterLink} to="/terms" color="primary">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link component={RouterLink} to="/privacy" color="primary">
                            Privacy Policy
                          </Link>
                        </Typography>
                      }
                    />
                    {touched.accept_terms && errors.accept_terms && (
                      <Typography variant="caption" color="error">
                        {errors.accept_terms}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isLoading || isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isLoading || isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : 'Sign Up'}
                </Button>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link 
                      component={RouterLink} 
                      to="/login" 
                      color="primary"
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register; 