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
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Transform as ConvertIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Storage as RepositoryIcon,
  VisibilityOutlined as ViewIcon,
  DateRange as DateIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { 
  fetchConversions, 
  deleteConversion,
  downloadConversion 
} from '../store/slices/conversionSlice';
import { openSnackbar } from '../store/slices/uiSlice';

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

const Conversions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversions, isLoading, error } = useSelector(state => state.conversion);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedConversionId, setSelectedConversionId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Fetch conversions on component mount
  useEffect(() => {
    dispatch(fetchConversions());
    
    // Set up polling for in-progress conversions
    const interval = setInterval(() => {
      if (conversions?.some(conv => conv.status === 'processing')) {
        dispatch(fetchConversions());
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  // Handle menu
  const handleMenuOpen = (event, conversionId) => {
    setAnchorEl(event.currentTarget);
    setSelectedConversionId(conversionId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConversionId(null);
  };
  
  // Handle deletion
  const handleDeleteConversion = () => {
    dispatch(deleteConversion(selectedConversionId))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Conversion deleted successfully!',
          severity: 'success'
        }));
        setDeleteDialogOpen(false);
        handleMenuClose();
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to delete conversion: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  // Handle download
  const handleDownloadConversion = (id) => {
    dispatch(downloadConversion(id))
      .unwrap()
      .then(() => {
        dispatch(openSnackbar({
          message: 'Download started!',
          severity: 'success'
        }));
        handleMenuClose();
      })
      .catch(err => {
        dispatch(openSnackbar({
          message: `Failed to download conversion: ${err.message || 'Unknown error'}`,
          severity: 'error'
        }));
      });
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter conversions
  const getFilteredConversions = () => {
    let filtered = [...(conversions || [])];
    
    // Filter by tab
    if (tabValue === 1) { // Completed conversions
      filtered = filtered.filter(conv => conv.status === 'completed');
    } else if (tabValue === 2) { // In Progress conversions
      filtered = filtered.filter(conv => conv.status === 'processing');
    } else if (tabValue === 3) { // Failed conversions
      filtered = filtered.filter(conv => conv.status === 'failed');
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => 
        (conv.name && conv.name.toLowerCase().includes(term)) || 
        (conv.repository && conv.repository.name.toLowerCase().includes(term)) ||
        (conv.description && conv.description.toLowerCase().includes(term))
      );
    }
    
    // Sort by created date, newest first
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return filtered;
  };
  
  const filteredConversions = getFilteredConversions();
  
  // Paginated conversions for table view
  const paginatedConversions = filteredConversions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
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
          Conversions
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<ConvertIcon />}
          component={Link}
          to="/conversions/new"
          color="secondary"
        >
          New Conversion
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error.message || 'Failed to load conversions'}
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
            aria-label="conversion tabs"
          >
            <Tab label="All Conversions" />
            <Tab label="Completed" />
            <Tab label="In Progress" />
            <Tab label="Failed" />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 2, sm: 0 } }}>
            <TextField
              placeholder="Search conversions..."
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
              sx={{ mr: 2 }}
            />
            
            <Tooltip title="Refresh">
              <IconButton onClick={() => dispatch(fetchConversions())}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
      
      {isLoading ? (
        <LinearProgress sx={{ my: 4 }} />
      ) : filteredConversions.length > 0 ? (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="conversions table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Repository</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedConversions.map((conversion) => (
                  <TableRow
                    key={conversion.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box
                        component={Link}
                        to={`/conversions/${conversion.id}`}
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ConvertIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body1">
                          {conversion.name || `Conversion #${conversion.id}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {conversion.repository ? (
                        <Box 
                          component={Link} 
                          to={`/repositories/${conversion.repository.id}`}
                          sx={{ 
                            textDecoration: 'none', 
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <RepositoryIcon sx={{ mr: 1, fontSize: 20 }} color="primary" />
                          <Typography variant="body2">
                            {conversion.repository.name}
                          </Typography>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(conversion.status)}
                        label={conversion.status}
                        color={
                          conversion.status === 'completed' ? 'success' :
                          conversion.status === 'failed' ? 'error' :
                          'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DateIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(conversion.created_at)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {conversion.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            component={Link} 
                            to={`/conversions/${conversion.id}`}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {conversion.status === 'completed' && (
                          <Tooltip title="Download">
                            <IconButton 
                              size="small"
                              onClick={() => handleDownloadConversion(conversion.id)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, conversion.id)}
                          aria-label="conversion options"
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredConversions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No conversions found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchTerm ? 'Try adjusting your search term' : 'Start your first conversion to see results here'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<ConvertIcon />}
              component={Link}
              to="/conversions/new"
              color="secondary"
              sx={{ mt: 2 }}
            >
              New Conversion
            </Button>
          )}
        </Box>
      )}
      
      {/* Conversion Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            navigate(`/conversions/${selectedConversionId}`);
            handleMenuClose();
          }}
        >
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {conversions?.find(c => c.id === selectedConversionId)?.status === 'completed' && (
          <MenuItem 
            onClick={() => {
              handleDownloadConversion(selectedConversionId);
              handleMenuClose();
            }}
          >
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Download
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          onClick={() => {
            setDeleteDialogOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Conversion
        </MenuItem>
      </Menu>
      
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
            onClick={handleDeleteConversion} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Conversions; 