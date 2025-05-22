import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  CardContent
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  GitHub as GitHubIcon,
  Google as GoogleIcon
} from '@mui/icons-material';

import { login, googleAuth } from '../../store/slices/authSlice';
import { openSnackbar } from '../../store/slices/uiSlice';
import Logo from '../../components/common/Logo';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/';
  
  // Redux state
  const { isLoading, error } = useSelector(state => state.auth);
  
  // Local state
  const [showPassword, setShowPassword] = useState(false);
  
  // Handle password visibility toggle
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(login(values))
      .unwrap()
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch(() => {
        setSubmitting(false);
      });
  };
  
  // Handle OAuth login
  const handleGoogleLogin = () => {
    dispatch(googleAuth())
      .unwrap()
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch(() => {});
  };
  
  const handleGitHubLogin = () => {
    // Comment out GitHub login since it's not implemented yet
    /*
    dispatch(loginWithGitHub())
      .unwrap()
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch(() => {});
    */
    // Display an alert that GitHub login is not yet available
    dispatch(openSnackbar({
      message: 'GitHub login is not available yet',
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
              Sign in to your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Please enter your details.
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error.message || 'Login failed. Please check your credentials.'}
            </Alert>
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
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
                  
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    fullWidth
                    variant="outlined"
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <Box>
                    {/* This would typically have a checkbox for "Remember me" but is omitted for simplicity */}
                  </Box>
                  <Link 
                    component={RouterLink} 
                    to="/forgot-password" 
                    variant="body2" 
                    color="primary"
                  >
                    Forgot password?
                  </Link>
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
                  ) : 'Sign In'}
                </Button>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GoogleIcon />}
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      Google
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GitHubIcon />}
                      onClick={handleGitHubLogin}
                      disabled={isLoading}
                    >
                      GitHub
                    </Button>
                  </Grid>
                </Grid>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link 
                      component={RouterLink} 
                      to="/register" 
                      color="primary"
                    >
                      Sign up now
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

export default Login; 