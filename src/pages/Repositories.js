import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  GitHub as GitHubIcon,
  FolderZip as UploadIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Storage as RepositoryIcon,
  Transform as ConvertIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material';

import { 
  fetchRepositories, 
  deleteRepository, 
  addRepository 
} from '../store/slices/repositorySlice';
import { openSnackbar } from '../store/slices/uiSlice';

const Repositories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { repositories, isLoading, error } = useSelector(state => state.repository);
  const { searchQuery, filterOptions } = useSelector(state => state.ui);
  
  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [dialogType, setDialogType] = useState('github'); // 'github' or 'upload'
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  
  // Fetch repositories on component mount
  useEffect(() => {
    dispatch(fetchRepositories());
  }, [dispatch]);
  
  // Handle dialog open and close
  const handleOpenDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setGithubUrl('');
    setRepositoryName('');
    setSelectedFile(null);
  };
  
  // Handle repository actions
  const handleAddRepository = () => {
    if (dialogType === 'github') {
      if (!githubUrl) return;
      
      dispatch(addRepository({ github_url: githubUrl }))
        .unwrap()
        .then(response => {
          dispatch(openSnackbar({
            message: 'Repository added successfully!',
            severity: 'success'
          }));
          handleCloseDialog();
          navigate(`/repositories/${response.id}`);
        })
        .catch(err => {
          dispatch(openSnackbar({
            message: `Failed to add repository: ${err.message || 'Unknown error'}`,
            severity: 'error'
          }));
        });
    } else {
      if (!selectedFile || !repositoryName) return;
      
      dispatch(addRepository({
        name: repositoryName,
        file: selectedFile
      }))
        .unwrap()
        .then(response => {
          dispatch(openSnackbar({
            message: 'Repository uploaded successfully!',
            severity: 'success'
          }));
          handleCloseDialog();
          navigate(`/repositories/${response.id}`);
        })
        .catch(err => {
          dispatch(openSnackbar({
            message: `Failed to upload repository: ${err.message || 'Unknown error'}`,
            severity: 'error'
          }));
        });
    }
  };
  
  const handleDeleteRepository = (id) => {
    dispatch(deleteRepository(id))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Repository deleted successfully!',
          severity: 'success'
        }));
        setAnchorEl(null);
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to delete repository: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!repositoryName) {
        // Extract name from filename by removing extension
        const fileName = file.name.split('.')[0];
        setRepositoryName(fileName);
      }
    }
  };
  
  // Handle menu
  const handleMenuOpen = (event, repoId) => {
    setAnchorEl(event.currentTarget);
    setSelectedRepoId(repoId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRepoId(null);
  };
  
  // Filter repositories
  const getFilteredRepositories = () => {
    let filtered = [...(repositories || [])];
    
    // Filter by tab
    if (tabValue === 1) { // GitHub repositories
      filtered = filtered.filter(repo => repo.source === 'github');
    } else if (tabValue === 2) { // Uploaded repositories
      filtered = filtered.filter(repo => repo.source === 'upload');
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(term) || 
        (repo.github_url && repo.github_url.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };
  
  const filteredRepositories = getFilteredRepositories();
  
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
  
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 3
      }}>
        <Typography variant="h4" gutterBottom component="h1">
          Repositories
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleOpenDialog('github')}
          >
            Add from GitHub
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => handleOpenDialog('upload')}
          >
            Upload Repository
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error.message || 'Failed to load repositories'}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          flexWrap: 'wrap'
        }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            aria-label="repository tabs"
          >
            <Tab label="All Repositories" />
            <Tab label="GitHub" />
            <Tab label="Uploaded" />
          </Tabs>
          
          <TextField
            placeholder="Search repositories..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 } }}
          />
        </Box>
      </Paper>
      
      {isLoading ? (
        <LinearProgress sx={{ my: 4 }} />
      ) : filteredRepositories.length > 0 ? (
        <Grid container spacing={3}>
          {filteredRepositories.map((repository) => (
            <Grid item xs={12} sm={6} md={4} key={repository.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6
                },
                transition: 'box-shadow 0.3s ease-in-out'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <RepositoryIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component={Link} to={`/repositories/${repository.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                        {repository.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, repository.id)}
                      aria-label="repository options"
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={repository.source}
                      color={repository.source === 'github' ? 'primary' : 'secondary'}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                      {getStatusIcon(repository.status)}
                      <Typography variant="caption" sx={{ ml: 0.5, textTransform: 'capitalize' }}>
                        {repository.status}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {repository.github_url && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2, 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {repository.github_url}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Files: {repository.file_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {repository.languages?.length > 0 ? 
                        `Languages: ${repository.languages.slice(0, 2).map(l => l.name).join(', ')}` + 
                        (repository.languages.length > 2 ? '...' : '') 
                        : 'No languages detected'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/repositories/${repository.id}`}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<ConvertIcon />}
                    component={Link}
                    to={`/conversions/new?repo=${repository.id}`}
                    color="secondary"
                    variant="outlined"
                    disabled={repository.status !== 'ready'}
                    sx={{ ml: 'auto' }}
                  >
                    Convert
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No repositories found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchTerm ? 'Try adjusting your search term' : 'Add your first repository to get started'}
          </Typography>
          {!searchTerm && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<GitHubIcon />}
                onClick={() => handleOpenDialog('github')}
                sx={{ mx: 1 }}
              >
                Add from GitHub
              </Button>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => handleOpenDialog('upload')}
                sx={{ mx: 1 }}
              >
                Upload Repository
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {/* Add Repository Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'github' ? 'Add GitHub Repository' : 'Upload Repository'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogType === 'github' 
              ? 'Enter the URL of a GitHub repository to analyze and convert.' 
              : 'Upload a ZIP file containing your repository.'}
          </DialogContentText>
          
          {dialogType === 'github' ? (
            <TextField
              autoFocus
              margin="dense"
              label="GitHub Repository URL"
              type="url"
              fullWidth
              variant="outlined"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GitHubIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mt: 2 }}
            />
          ) : (
            <>
              <Box sx={{ mt: 2 }}>
                <TextField
                  margin="dense"
                  label="Repository Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={repositoryName}
                  onChange={(e) => setRepositoryName(e.target.value)}
                  required
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <input
                  accept=".zip,.rar,.tar.gz"
                  style={{ display: 'none' }}
                  id="repo-file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="repo-file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    {selectedFile ? selectedFile.name : 'Select Repository File'}
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAddRepository} 
            variant="contained" 
            disabled={dialogType === 'github' ? !githubUrl : (!selectedFile || !repositoryName)}
          >
            {dialogType === 'github' ? 'Add Repository' : 'Upload Repository'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Repository Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            navigate(`/repositories/${selectedRepoId}`);
            handleMenuClose();
          }}
        >
          <RepositoryIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem 
          onClick={() => {
            navigate(`/conversions/new?repo=${selectedRepoId}`);
            handleMenuClose();
          }}
        >
          <ConvertIcon fontSize="small" sx={{ mr: 1 }} />
          Convert to Text
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            handleDeleteRepository(selectedRepoId);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Repository
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Repositories; 