import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Storage as RepositoryIcon,
  Transform as ConversionIcon,
  Timeline as AnalysisIcon,
  AccessTime as TimeIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material';

import { fetchRepositories } from '../store/slices/repositorySlice';
import { fetchConversions } from '../store/slices/conversionSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { repositories, isLoading: repoLoading } = useSelector(state => state.repository);
  const { conversions, isLoading: convLoading } = useSelector(state => state.conversion);
  
  useEffect(() => {
    dispatch(fetchRepositories());
    dispatch(fetchConversions());
  }, [dispatch]);
  
  // Calculate usage statistics
  const totalRepositories = repositories?.length || 0;
  const totalConversions = conversions?.length || 0;
  const completedConversions = conversions?.filter(c => c.status === 'completed')?.length || 0;
  const failedConversions = conversions?.filter(c => c.status === 'failed')?.length || 0;
  const pendingConversions = conversions?.filter(c => c.status === 'pending' || c.status === 'in_progress')?.length || 0;
  
  // Sort recent activities (combines repos and conversions)
  const recentActivities = [
    ...(repositories?.map(repo => ({
      id: `repo-${repo.id}`,
      type: 'repository',
      title: repo.name,
      status: repo.status,
      date: new Date(repo.created_at),
      link: `/repositories/${repo.id}`
    })) || []),
    ...(conversions?.map(conv => ({
      id: `conv-${conv.id}`,
      type: 'conversion',
      title: conv.repository?.name || `Conversion #${conv.id}`,
      status: conv.status,
      date: new Date(conv.start_time),
      link: `/conversions/${conv.id}`
    })) || [])
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);
  
  // Helper for status icons
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
      case 'ready':
        return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'failed':
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <PendingIcon sx={{ color: 'warning.main' }} />;
    }
  };
  
  // Subscription info
  const isSubscribed = user?.subscription_status === 'subscribed';
  const isTrial = user?.subscription_status === 'free_trial';
  const trialEndsAt = user?.subscription_end_date ? new Date(user?.subscription_end_date) : null;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  
  const isLoading = repoLoading || convLoading;
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      
      {/* Subscription status card */}
      {isTrial && (
        <Card sx={{ mb: 4, bgcolor: 'warning.light' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6">
                  Free Trial Period
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {daysLeft > 0 
                    ? `Your trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` 
                    : 'Your trial has ended'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link}
                  to="/settings"
                  sx={{ mt: { xs: 1, md: 0 } }}
                >
                  Upgrade to Premium
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <RepositoryIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Repositories
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                {isLoading ? <LinearProgress /> : totalRepositories}
              </Typography>
              <Button 
                component={Link} 
                to="/repositories" 
                variant="outlined" 
                color="primary" 
                fullWidth
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <ConversionIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Conversions
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                {isLoading ? <LinearProgress /> : totalConversions}
              </Typography>
              <Button 
                component={Link} 
                to="/conversions" 
                variant="outlined" 
                color="secondary" 
                fullWidth
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Completed
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ textAlign: 'center', my: 2 }}>
                {isLoading ? <LinearProgress /> : completedConversions}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Chip 
                  label={`Pending: ${pendingConversions}`} 
                  color="warning" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={`Failed: ${failedConversions}`} 
                  color="error" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <AnalysisIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Usage Limit
                </Typography>
              </Box>
              {isSubscribed ? (
                <Typography variant="h6" component="div" sx={{ textAlign: 'center', my: 2 }}>
                  Unlimited
                </Typography>
              ) : (
                <>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((totalConversions / 10) * 100, 100)} 
                    sx={{ my: 2, height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {totalConversions}/10 conversions {isTrial ? 'in trial' : 'used'}
                  </Typography>
                </>
              )}
              <Button 
                component={Link} 
                to="/settings" 
                variant="outlined" 
                color="info" 
                fullWidth
                sx={{ mt: 2 }}
              >
                {isSubscribed ? 'Manage Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent activity list */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {isLoading ? (
                <LinearProgress />
              ) : recentActivities.length > 0 ? (
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem 
                      key={activity.id} 
                      component={Link} 
                      to={activity.link}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: activity.type === 'repository' ? 'primary.main' : 'secondary.main' 
                        }}>
                          {activity.type === 'repository' ? <RepositoryIcon /> : <ConversionIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={activity.title}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                            <span>{activity.date.toLocaleString()}</span>
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                              {getStatusIcon(activity.status)}
                              <span style={{ marginLeft: '4px', textTransform: 'capitalize' }}>
                                {activity.status}
                              </span>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recent activities. Start by adding a repository.
                </Typography>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={Link}
                  to="/repositories"
                  sx={{ mx: 1 }}
                >
                  Add Repository
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  component={Link}
                  to="/conversions"
                  sx={{ mx: 1 }}
                >
                  View Conversions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 