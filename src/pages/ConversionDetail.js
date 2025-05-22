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
  Tabs,
  Tab,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Storage as RepositoryIcon,
  Transform as ConvertIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Description as FileIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import { 
  fetchConversionDetails, 
  deleteConversion,
  downloadConversion 
} from '../store/slices/conversionSlice';
import { openSnackbar } from '../store/slices/uiSlice';

// Helper function - Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`conversion-tabpanel-${index}`}
      aria-labelledby={`conversion-tab-${index}`}
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

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch(status) {
    case 'completed':
      return <CheckIcon sx={{ color: 'success.main' }} />;
    case 'failed':
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    case 'processing':
      return <PendingIcon sx={{ color: 'warning.main' }} />;
    default:
      return <PendingIcon sx={{ color: 'info.main' }} />;
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Helper function to format duration
const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  
  // Format as minutes and seconds
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const ConversionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedConversion, isLoading, error } = useSelector(state => state.conversion);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expandedFile, setExpandedFile] = useState(null);
  
  // Fetch conversion on component mount
  useEffect(() => {
    dispatch(fetchConversionDetails(id));
    
    // Poll for updates if conversion is in progress
    let interval;
    if (selectedConversion?.status === 'processing') {
      interval = setInterval(() => {
        dispatch(fetchConversionDetails(id));
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dispatch, id, selectedConversion?.status]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle delete conversion
  const handleDeleteConversion = () => {
    dispatch(deleteConversion(id))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Conversion deleted successfully!',
          severity: 'success'
        }));
        navigate('/conversions');
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to delete conversion: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  // Handle download conversion
  const handleDownloadConversion = () => {
    dispatch(downloadConversion(id))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Download started!',
          severity: 'success'
        }));
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to download conversion: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  // Handle accordion toggle
  const handleAccordionChange = (fileId) => (event, isExpanded) => {
    setExpandedFile(isExpanded ? fileId : null);
  };
  
  if (isLoading && !selectedConversion) {
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
          Error: {error.message || 'Failed to load conversion details'}
        </Alert>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/conversions')}
          sx={{ mt: 2 }}
        >
          Back to Conversions
        </Button>
      </Box>
    );
  }
  
  if (!selectedConversion) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Conversion not found
        </Alert>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/conversions')}
          sx={{ mt: 2 }}
        >
          Back to Conversions
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<BackIcon />}
          onClick={() => navigate('/conversions')}
        >
          Back to Conversions
        </Button>
      </Box>
      
      {/* Conversion Header */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <ConvertIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                {selectedConversion.name || `Conversion #${selectedConversion.id}`}
              </Typography>
              
              {selectedConversion.repository && (
                <Box
                  component={Link}
                  to={`/repositories/${selectedConversion.repository.id}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'text.secondary'
                  }}
                >
                  <RepositoryIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body1">
                    {selectedConversion.repository.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedConversion.status === 'completed' && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadConversion}
              >
                Download
              </Button>
            )}
            <Tooltip title="Delete Conversion">
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
            icon={getStatusIcon(selectedConversion.status)}
            label={selectedConversion.status}
            color={
              selectedConversion.status === 'completed' ? 'success' :
              selectedConversion.status === 'failed' ? 'error' :
              'warning'
            }
          />
          {selectedConversion.format && (
            <Chip
              icon={<FileIcon />}
              label={`Format: ${selectedConversion.format}`}
              variant="outlined"
            />
          )}
          {selectedConversion.output_type && (
            <Chip
              icon={<CodeIcon />}
              label={`Type: ${selectedConversion.output_type}`}
              variant="outlined"
            />
          )}
        </Box>
        
        {selectedConversion.description && (
          <Typography variant="body1" paragraph>
            {selectedConversion.description}
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Created:
            </Typography>
            <Typography variant="body1">
              {formatDate(selectedConversion.created_at)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Completed:
            </Typography>
            <Typography variant="body1">
              {formatDate(selectedConversion.completed_at)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Duration:
            </Typography>
            <Typography variant="body1">
              {formatDuration(selectedConversion.created_at, selectedConversion.completed_at)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Files Processed:
            </Typography>
            <Typography variant="body1">
              {selectedConversion.file_count || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
        
        {selectedConversion.status === 'processing' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Processing... This may take a few minutes.
            </Typography>
            <LinearProgress color="secondary" />
          </Box>
        )}
        
        {selectedConversion.status === 'failed' && selectedConversion.error_message && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Error:</Typography>
            <Typography variant="body2">{selectedConversion.error_message}</Typography>
          </Alert>
        )}
      </Paper>
      
      {/* Conversion Content */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="conversion tabs">
            <Tab label="Overview" />
            <Tab label="Files" />
            {selectedConversion.configuration && <Tab label="Configuration" />}
            {selectedConversion.logs && <Tab label="Logs" />}
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Conversion Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(selectedConversion.status)}
                        <Typography variant="body1" sx={{ ml: 0.5, textTransform: 'capitalize' }}>
                          {selectedConversion.status}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Type:
                      </Typography>
                      <Typography variant="body1">
                        {selectedConversion.output_type || 'Standard'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Format:
                      </Typography>
                      <Typography variant="body1">
                        {selectedConversion.format || 'Document'}
                      </Typography>
                    </Grid>
                    {selectedConversion.model && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Model:
                        </Typography>
                        <Typography variant="body1">
                          {selectedConversion.model}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Files Processed:
                      </Typography>
                      <Typography variant="body1">
                        {selectedConversion.file_count || 'N/A'}
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
                    Processing Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Created:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedConversion.created_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Started:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedConversion.started_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Completed:
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedConversion.completed_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duration:
                      </Typography>
                      <Typography variant="body1">
                        {formatDuration(selectedConversion.started_at, selectedConversion.completed_at)}
                      </Typography>
                    </Grid>
                    {selectedConversion.size && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Output Size:
                        </Typography>
                        <Typography variant="body1">
                          {typeof selectedConversion.size === 'number' 
                            ? `${(selectedConversion.size / 1024).toFixed(2)} KB` 
                            : selectedConversion.size}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              {selectedConversion.status === 'completed' ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadConversion}
                    size="large"
                    color="secondary"
                  >
                    Download Conversion Result
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Your converted document is ready to download
                  </Typography>
                </Box>
              ) : selectedConversion.status === 'processing' ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress color="secondary" />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Your conversion is being processed...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This may take several minutes depending on the repository size.
                  </Typography>
                </Box>
              ) : (
                <Alert
                  severity="error"
                  sx={{ my: 2 }}
                  action={
                    <Button 
                      color="inherit" 
                      size="small" 
                      component={Link}
                      to={`/conversions/new?repo=${selectedConversion.repository?.id}`}
                    >
                      Try Again
                    </Button>
                  }
                >
                  <Typography variant="subtitle1">Conversion Failed</Typography>
                  <Typography variant="body2">{selectedConversion.error_message || 'An error occurred during processing'}</Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Files Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Converted Files
            </Typography>
            
            {selectedConversion.files?.length > 0 ? (
              <Box>
                {selectedConversion.files.map((file, index) => (
                  <Accordion 
                    key={file.id || index}
                    expanded={expandedFile === (file.id || index)}
                    onChange={handleAccordionChange(file.id || index)}
                    sx={{ 
                      mb: 1,
                      '&:before': {
                        display: 'none',
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`file-${file.id || index}-content`}
                      id={`file-${file.id || index}-header`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography sx={{ flexGrow: 1 }}>
                          {file.name || `File ${index + 1}`}
                        </Typography>
                        
                        {file.status && (
                          <Chip
                            size="small"
                            label={file.status}
                            color={
                              file.status === 'completed' ? 'success' :
                              file.status === 'failed' ? 'error' :
                              'warning'
                            }
                            sx={{ mr: 1 }}
                          />
                        )}
                        
                        {file.size && (
                          <Typography variant="body2" color="text.secondary">
                            {typeof file.size === 'number' 
                              ? `${(file.size / 1024).toFixed(2)} KB` 
                              : file.size}
                          </Typography>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {file.preview ? (
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            maxHeight: 300, 
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            backgroundColor: 'background.paper',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {file.preview}
                        </Paper>
                      ) : file.error ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {file.error}
                        </Alert>
                      ) : (
                        <Typography color="text.secondary">
                          Preview not available
                        </Typography>
                      )}
                      
                      {file.path && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Path: {file.path}
                          </Typography>
                        </Box>
                      )}
                      
                      {file.metadata && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Metadata:
                          </Typography>
                          <Grid container spacing={1}>
                            {Object.entries(file.metadata).map(([key, value]) => (
                              <Grid item xs={6} key={key}>
                                <Typography variant="body2" color="text.secondary">
                                  {key}:
                                </Typography>
                                <Typography variant="body2">
                                  {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                      
                      {selectedConversion.status === 'completed' && (
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => {
                              // Logic to download individual file
                              dispatch(openSnackbar({
                                message: 'Individual file download not implemented yet',
                                severity: 'info'
                              }));
                            }}
                          >
                            Download
                          </Button>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                {selectedConversion.status === 'processing' ? (
                  <>
                    <CircularProgress color="secondary" size={40} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Files are being processed...
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No files available
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>
        
        {/* Configuration Tab */}
        {selectedConversion.configuration && (
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conversion Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {Object.entries(selectedConversion.configuration).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {key}:
                        </Typography>
                        <Typography variant="body1">
                          {typeof value === 'object' 
                            ? JSON.stringify(value, null, 2) 
                            : value.toString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        )}
        
        {/* Logs Tab */}
        {selectedConversion.logs && (
          <TabPanel value={tabValue} index={selectedConversion.configuration ? 3 : 2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conversion Logs
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    maxHeight: 500, 
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    backgroundColor: 'background.paper'
                  }}
                >
                  {typeof selectedConversion.logs === 'string' 
                    ? selectedConversion.logs
                    : JSON.stringify(selectedConversion.logs, null, 2)}
                </Paper>
              </CardContent>
            </Card>
          </TabPanel>
        )}
      </Paper>
      
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Conversion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversion? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleDeleteConversion();
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

export default ConversionDetail; 