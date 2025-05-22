import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  DeleteOutline as DeleteIcon,
  Sync as SyncIcon,
  Transform as ConvertIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  Terminal as TerminalIcon,
  Storage as RepositoryIcon,
  ArrowBack as BackIcon,
  Code as CodeIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Language as LanguageIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

import { 
  fetchRepositoryDetails, 
  deleteRepository, 
  syncRepository,
  analyzeRepository 
} from '../store/slices/repositorySlice';
import { openSnackbar } from '../store/slices/uiSlice';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`repo-tabpanel-${index}`}
      aria-labelledby={`repo-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RepositoryDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedRepository, isLoading, error } = useSelector(state => state.repository);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch repository on component mount
  useEffect(() => {
    dispatch(fetchRepositoryDetails(id));
  }, [dispatch, id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle repository actions
  const handleDeleteRepository = () => {
    dispatch(deleteRepository(id))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Repository deleted successfully!',
          severity: 'success'
        }));
        navigate('/repositories');
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to delete repository: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  const handleSyncRepository = () => {
    dispatch(syncRepository(id))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Repository sync initiated!',
          severity: 'success'
        }));
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to sync repository: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  const handleAnalyzeRepository = () => {
    dispatch(analyzeRepository(id))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Repository analysis initiated!',
          severity: 'success'
        }));
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to analyze repository: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'ready':
        return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'analyzing':
        return <PendingIcon sx={{ color: 'warning.main' }} />;
      default:
        return <PendingIcon sx={{ color: 'info.main' }} />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Error: {error.message || 'Failed to load repository details'}
        </Alert>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/repositories')}
          sx={{ mt: 2 }}
        >
          Back to Repositories
        </Button>
      </Box>
    );
  }
  
  if (!selectedRepository) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Repository not found
        </Alert>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/repositories')}
          sx={{ mt: 2 }}
        >
          Back to Repositories
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/repositories')}
        >
          Back to Repositories
        </Button>
      </Box>
      
      {/* Repository Header */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <RepositoryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                {selectedRepository.name}
              </Typography>
              
              {selectedRepository.github_url && (
                <Typography 
                  variant="body1" 
                  component="a" 
                  href={selectedRepository.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'text.secondary'
                  }}
                >
                  <GitHubIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {selectedRepository.github_url}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedRepository.source === 'github' && (
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleSyncRepository}
                disabled={selectedRepository.status === 'analyzing'}
              >
                Sync
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<TerminalIcon />}
              onClick={handleAnalyzeRepository}
              disabled={selectedRepository.status === 'analyzing'}
            >
              Analyze
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ConvertIcon />}
              component={Link}
              to={`/conversions/new?repo=${selectedRepository.id}`}
              disabled={selectedRepository.status !== 'ready'}
            >
              Convert to Text
            </Button>
            <Tooltip title="Delete Repository">
              <IconButton 
                color="error" 
                onClick={() => setDeleteDialogOpen(true)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip
            label={selectedRepository.source}
            color={selectedRepository.source === 'github' ? 'primary' : 'secondary'}
            variant="outlined"
          />
          <Chip
            icon={getStatusIcon(selectedRepository.status)}
            label={selectedRepository.status}
            color={
              selectedRepository.status === 'ready' ? 'success' :
              selectedRepository.status === 'error' ? 'error' :
              'warning'
            }
            variant="outlined"
          />
          <Chip
            icon={<FileIcon />}
            label={`${selectedRepository.file_count || 0} files`}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Created:
            </Typography>
            <Typography variant="body1">
              {formatDate(selectedRepository.created_at)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Last Updated:
            </Typography>
            <Typography variant="body1">
              {formatDate(selectedRepository.updated_at)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Last Analyzed:
            </Typography>
            <Typography variant="body1">
              {formatDate(selectedRepository.last_analyzed_at)}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Repository Content */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="repository tabs">
            <Tab label="Overview" />
            <Tab label="Files" />
            <Tab label="Languages" />
            <Tab label="Conversions" />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Repository Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Files:
                      </Typography>
                      <Typography variant="body1">
                        {selectedRepository.file_count || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Languages:
                      </Typography>
                      <Typography variant="body1">
                        {selectedRepository.languages?.length || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Description:
                      </Typography>
                      <Typography variant="body1">
                        {selectedRepository.description || 'No description available'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Languages
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {selectedRepository.languages?.length > 0 ? (
                    <List>
                      {selectedRepository.languages.slice(0, 5).map((language) => (
                        <ListItem key={language.name}>
                          <ListItemIcon>
                            <LanguageIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={language.name}
                            secondary={`${language.percentage}% - ${language.files_count} files`}
                          />
                        </ListItem>
                      ))}
                      {selectedRepository.languages.length > 5 && (
                        <ListItem>
                          <ListItemText 
                            secondary={`+${selectedRepository.languages.length - 5} more languages`} 
                            sx={{ textAlign: 'center' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No languages detected
                    </Typography>
                  )}
                </CardContent>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => setTabValue(2)}
                    endIcon={<BackIcon sx={{ transform: 'rotate(180deg)' }} />}
                  >
                    View All Languages
                  </Button>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Conversions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {selectedRepository.conversions?.length > 0 ? (
                    <List>
                      {selectedRepository.conversions.slice(0, 3).map((conversion) => (
                        <ListItem 
                          key={conversion.id} 
                          component={Link} 
                          to={`/conversions/${conversion.id}`}
                          sx={{ 
                            textDecoration: 'none', 
                            color: 'inherit',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemIcon>
                            <ConvertIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={conversion.name || `Conversion #${conversion.id}`}
                            secondary={formatDate(conversion.created_at)}
                          />
                          <Chip
                            label={conversion.status}
                            color={
                              conversion.status === 'completed' ? 'success' :
                              conversion.status === 'failed' ? 'error' :
                              'warning'
                            }
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No conversions yet
                    </Typography>
                  )}
                </CardContent>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    size="small" 
                    onClick={() => setTabValue(3)}
                    endIcon={<BackIcon sx={{ transform: 'rotate(180deg)' }} />}
                  >
                    View All Conversions
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="secondary"
                    startIcon={<ConvertIcon />}
                    component={Link}
                    to={`/conversions/new?repo=${selectedRepository.id}`}
                    disabled={selectedRepository.status !== 'ready'}
                  >
                    New Conversion
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Files Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Directory Structure
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {selectedRepository.files?.length > 0 ? (
                <List>
                  {selectedRepository.files.map((file) => (
                    <ListItem key={file.path}>
                      <ListItemIcon>
                        {file.type === 'directory' ? <FolderIcon color="primary" /> : <FileIcon />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name}
                        secondary={file.path}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {file.type === 'file' && `${file.size} bytes`}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No files available
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Languages Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Languages
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {selectedRepository.languages?.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedRepository.languages.map((language) => (
                    <Grid item xs={12} sm={6} md={4} key={language.name}>
                      <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LanguageIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            {language.name}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Percentage:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={language.percentage} 
                                sx={{ 
                                  height: 10, 
                                  borderRadius: 5,
                                  bgcolor: 'background.paper',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 5
                                  }
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {`${language.percentage}%`}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Files:
                            </Typography>
                            <Typography variant="body1">
                              {language.files_count}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Lines:
                            </Typography>
                            <Typography variant="body1">
                              {language.lines_count || 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No languages detected
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        {/* Conversions Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<ConvertIcon />}
              component={Link}
              to={`/conversions/new?repo=${selectedRepository.id}`}
              disabled={selectedRepository.status !== 'ready'}
            >
              New Conversion
            </Button>
          </Box>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversion History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {selectedRepository.conversions?.length > 0 ? (
                <List>
                  {selectedRepository.conversions.map((conversion) => (
                    <ListItem 
                      key={conversion.id} 
                      component={Link} 
                      to={`/conversions/${conversion.id}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        },
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}
                    >
                      <ListItemIcon>
                        <ConvertIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" component="span">
                              {conversion.name || `Conversion #${conversion.id}`}
                            </Typography>
                            <Chip
                              label={conversion.status}
                              color={
                                conversion.status === 'completed' ? 'success' :
                                conversion.status === 'failed' ? 'error' :
                                'warning'
                              }
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                              <Typography variant="caption">
                                {formatDate(conversion.created_at)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {conversion.description || 'No description'}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box>
                        {conversion.status === 'completed' && (
                          <Tooltip title="Download">
                            <IconButton>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No conversions yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Repository</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedRepository.name}"? This action cannot be undone, and all associated conversions will also be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleDeleteRepository();
              setDeleteDialogOpen(false);
            }} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RepositoryDetail; 