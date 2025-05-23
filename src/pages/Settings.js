import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  CreditCard as CreditCardIcon,
  Key as KeyIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  AccountCircle as AccountIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  IntegrationInstructions as IntegrationIcon
} from '@mui/icons-material';

import { 
  fetchUserProfile, 
  updateUserProfile, 
  changePassword, 
  deleteAccount, 
  subscribe
} from '../store/slices/authSlice';
import { openSnackbar } from '../store/slices/uiSlice';
import PayPalCheckout from '../components/payments/PayPalCheckout';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector(state => state.auth);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    job_title: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    conversion_complete: true,
    new_features: true,
    repository_updates: true
  });
  
  // Initialize profile data from redux store
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        company: user.company || '',
        job_title: user.job_title || ''
      });
      
      setNotificationSettings({
        email_notifications: user.notification_settings?.email_notifications ?? true,
        conversion_complete: user.notification_settings?.conversion_complete ?? true,
        new_features: user.notification_settings?.new_features ?? true,
        repository_updates: user.notification_settings?.repository_updates ?? true
      });
    }
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile edit
  const handleEditProfile = () => {
    setEditingProfile(true);
  };
  
  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle notification setting change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle profile save
  const handleSaveProfile = () => {
    setProfileError('');
    
    dispatch(updateUserProfile(profileData))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Profile updated successfully!',
          severity: 'success'
        }));
        setEditingProfile(false);
      })
      .catch(err => {
        setProfileError(err.message || 'Failed to update profile');
      });
  };
  
  // Handle password save
  const handleSavePassword = () => {
    setPasswordError('');
    
    // Validate password match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Validate password strength
    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    dispatch(changePassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password
    }))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Password changed successfully!',
          severity: 'success'
        }));
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      })
      .catch(err => {
        setPasswordError(err.message || 'Failed to change password');
      });
  };
  
  // Handle delete account
  const handleDeleteAccount = () => {
    if (deleteConfirmation !== 'DELETE') {
      return;
    }
    
    dispatch(deleteAccount())
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Account deleted successfully',
          severity: 'success'
        }));
        navigate('/login');
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to delete account: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
        setShowDeleteDialog(false);
      });
  };
  
  // Handle save notification settings
  const handleSaveNotifications = () => {
    dispatch(updateUserProfile({ notification_settings: notificationSettings }))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Notification settings updated successfully!',
          severity: 'success'
        }));
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to update notification settings: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  // Handle subscription success
  const handleSubscriptionSuccess = (paymentDetails) => {
    // Extract payment token from the PayPal transaction
    const paymentToken = paymentDetails.id;
    
    // Process subscription with backend
    dispatch(subscribe(paymentToken))
      .unwrap()
      .then((response) => {
        dispatch(openSnackbar({
          message: 'Subscription successful!',
          severity: 'success'
        }));
        // Refresh user profile to update subscription status
        dispatch(fetchUserProfile());
      })
      .catch((error) => {
        dispatch(openSnackbar({
          message: `Subscription failed: ${error.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  // Get user avatar text
  const getUserAvatarText = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };
  
  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Settings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error.message || 'Failed to load user settings'}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<AccountIcon />} iconPosition="start" label="Profile" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
            <Tab icon={<CreditCardIcon />} iconPosition="start" label="Subscription" />
            <Tab icon={<IntegrationIcon />} iconPosition="start" label="Integrations" />
          </Tabs>
        </Box>
        
        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'primary.main', 
                fontSize: '2rem',
                mr: 3
              }}
            >
              {getUserAvatarText()}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {user?.first_name && user?.last_name ? 
                  `${user.first_name} ${user.last_name}` : 
                  user?.email || 'User'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user?.company && user?.job_title ? 
                  `${user.job_title} at ${user.company}` : 
                  user?.company || user?.job_title || 'No company information'}
              </Typography>
            </Box>
          </Box>
          
          {profileError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {profileError}
            </Alert>
          )}
          
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Personal Information" 
              action={
                !editingProfile ? (
                  <Button 
                    startIcon={<EditIcon />} 
                    onClick={handleEditProfile}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button 
                    startIcon={<SaveIcon />} 
                    onClick={handleSaveProfile}
                    color="primary"
                  >
                    Save
                  </Button>
                )
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!editingProfile}
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Company"
                    name="company"
                    value={profileData.company}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Job Title"
                    name="job_title"
                    value={profileData.job_title}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader 
              title="Account Actions" 
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Change Password" />
            <CardContent>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {passwordError}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    fullWidth
                    type="password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="New Password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    fullWidth
                    type="password"
                    helperText="Password must be at least 8 characters long"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirm New Password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    fullWidth
                    type="password"
                    error={passwordData.new_password !== passwordData.confirm_password && passwordData.confirm_password !== ''}
                    helperText={passwordData.new_password !== passwordData.confirm_password && passwordData.confirm_password !== '' ? 'Passwords do not match' : ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleSavePassword}
                      disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader title="Security Settings" />
            <CardContent>
              <FormControlLabel
                control={<Switch checked={true} />}
                label="Two-Factor Authentication"
                disabled
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -1 }}>
                Coming soon
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader 
              title="Notification Preferences" 
              action={
                <Button 
                  startIcon={<SaveIcon />} 
                  onClick={handleSaveNotifications}
                  color="primary"
                >
                  Save
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.email_notifications} 
                        onChange={handleNotificationChange}
                        name="email_notifications"
                      />
                    }
                    label="Email Notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    Receive notifications via email
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Notification Types
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.conversion_complete} 
                        onChange={handleNotificationChange}
                        name="conversion_complete"
                        disabled={!notificationSettings.email_notifications}
                      />
                    }
                    label="Conversion Completed"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    Receive notifications when your conversion is complete
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.repository_updates} 
                        onChange={handleNotificationChange}
                        name="repository_updates"
                        disabled={!notificationSettings.email_notifications}
                      />
                    }
                    label="Repository Updates"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    Receive notifications about changes to your repositories
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={notificationSettings.new_features} 
                        onChange={handleNotificationChange}
                        name="new_features"
                        disabled={!notificationSettings.email_notifications}
                      />
                    }
                    label="New Features"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    Receive notifications about new features and updates
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Subscription Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Current Plan" 
              subheader={user?.subscription?.plan_name || 'Free Trial'}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" color="primary">
                  {user?.subscription?.price ? `$${user.subscription.price}/month` : 'Free'}
                </Typography>
                
                {user?.subscription?.status === 'active' ? (
                  <Chip label="Active" color="success" />
                ) : user?.subscription?.status === 'trial' ? (
                  <Chip label="Trial" color="info" />
                ) : (
                  <Chip label="Inactive" color="error" />
                )}
              </Box>
              
              {user?.subscription?.trial_ends_at && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Your free trial ends on {new Date(user.subscription.trial_ends_at).toLocaleDateString()}.
                  {' '}
                  {new Date(user.subscription.trial_ends_at) > new Date() ? (
                    `${Math.ceil((new Date(user.subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))} days remaining.`
                  ) : 'Your trial has expired.'}
                </Alert>
              )}
              
              {user?.subscription?.features && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Features:
                  </Typography>
                  <Grid container spacing={1}>
                    {user.subscription.features.map((feature, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1">• {feature}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {user?.subscription?.status === 'trial' || !user?.subscription ? (
                  <Button 
                    variant="contained" 
                    color="primary"
                    disabled
                  >
                    Upgrade Now
                  </Button>
                ) : user?.subscription?.status === 'active' ? (
                  <Button 
                    variant="outlined" 
                    color="primary"
                    disabled
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary"
                    disabled
                  >
                    Reactivate Subscription
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader title="Available Plans" />
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                Subscription management is coming soon.
              </Typography>
            </CardContent>
          </Card>
          
          {(user?.subscription?.status !== 'active') && (
            <Card>
              <CardHeader title="Upgrade to Premium" />
              <CardContent>
                <PayPalCheckout 
                  onSuccess={handleSubscriptionSuccess}
                />
              </CardContent>
            </Card>
          )}
        </TabPanel>
        
        {/* Integrations Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Connected Accounts" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center', 
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="img" 
                        src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" 
                        alt="GitHub Logo"
                        sx={{ width: 30, height: 30, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          GitHub
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user?.integrations?.github ? 'Connected' : 'Not connected'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant={user?.integrations?.github ? "outlined" : "contained"} 
                      color={user?.integrations?.github ? "error" : "primary"}
                      disabled
                    >
                      {user?.integrations?.github ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center', 
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        component="img" 
                        src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" 
                        alt="Google Drive Logo"
                        sx={{ width: 30, height: 30, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Google Drive
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user?.integrations?.google_drive ? 'Connected' : 'Not connected'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant={user?.integrations?.google_drive ? "outlined" : "contained"} 
                      color={user?.integrations?.google_drive ? "error" : "primary"}
                      disabled
                    >
                      {user?.integrations?.google_drive ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info">
                    Integration functionality is coming soon.
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader title="API Access" />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="subtitle1">API Key</Typography>
                  <TextField
                    disabled
                    size="small"
                    value="••••••••••••••••••••••••••"
                    sx={{ width: 300 }}
                  />
                </Box>
                <Button variant="outlined" disabled>
                  Generate New Key
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                API access is coming soon. You will be able to integrate Code2Text with your own applications and workflows.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </DialogContentText>
          <DialogContentText color="error" sx={{ mb: 2 }}>
            To confirm, please type "DELETE" in the field below:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            disabled={deleteConfirmation !== 'DELETE'}
          >
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 