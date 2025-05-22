import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../store/slices/authSlice';
import { openSnackbar } from '../../store/slices/uiSlice';

// Validation schema
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required')
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(resetPassword({ token, password: values.password }))
      .unwrap()
      .then(() => {
        setResetSuccess(true);
        dispatch(openSnackbar({
          message: 'Password reset successful! You can now log in with your new password.',
          severity: 'success'
        }));
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: err.message || 'Password reset failed. Please try again.',
          severity: 'error'
        }));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (resetSuccess) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Password reset successful! You will be redirected to the login page shortly.
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Reset Password
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Enter your new password below
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Token is invalid or has expired. Please request a new password reset.'}
        </Alert>
      )}

      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={ResetPasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              name="password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Field
              as={TextField}
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting || isLoading}
              sx={{ mt: 3 }}
            >
              {isSubmitting || isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Reset Password'
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default ResetPassword; 