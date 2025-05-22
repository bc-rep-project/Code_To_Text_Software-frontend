import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  TextField,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  Checkbox,
  CircularProgress,
  Alert,
  InputLabel,
  Select,
  Chip,
  Tooltip,
  IconButton,
  OutlinedInput,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Storage as RepositoryIcon,
  Transform as ConvertIcon,
  Description as FileIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  ArrowForward as NextIcon,
  Check as CheckIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import { 
  fetchRepositories, 
  fetchRepositoryDetails,
} from '../store/slices/repositorySlice';
import { 
  createConversion 
} from '../store/slices/conversionSlice';
import { openSnackbar } from '../store/slices/uiSlice';

// Helper function to use query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Validation schema for the form
const ValidationSchema = Yup.object().shape({
  repository_id: Yup.string().required('Please select a repository'),
  name: Yup.string().required('Please enter a conversion name'),
  description: Yup.string(),
  output_format: Yup.string().required('Please select an output format'),
  output_type: Yup.string().required('Please select an output type'),
  conversion_settings: Yup.object(),
  include_documentation: Yup.boolean(),
  include_tests: Yup.boolean(),
  include_todos: Yup.boolean(),
  model: Yup.string()
});

// Output format options
const outputFormats = [
  { value: 'markdown', label: 'Markdown (.md)', description: 'Simple text format with basic formatting' },
  { value: 'pdf', label: 'PDF Document (.pdf)', description: 'Portable Document Format with formatting and pagination' },
  { value: 'word', label: 'Word Document (.docx)', description: 'Microsoft Word document with rich formatting and styles' },
  { value: 'html', label: 'HTML (.html)', description: 'Web-based format with interactive elements' },
  { value: 'plain', label: 'Plain Text (.txt)', description: 'Simple text without formatting' }
];

// Output type options
const outputTypes = [
  { value: 'standard', label: 'Standard', description: 'Basic conversion with code structure explanation' },
  { value: 'detailed', label: 'Detailed', description: 'In-depth explanation with code analysis and context' },
  { value: 'summary', label: 'Summary', description: 'High-level overview of the code functionality' },
  { value: 'tutorial', label: 'Tutorial', description: 'Step-by-step explanation formatted as a tutorial' }
];

// Language model options
const languageModels = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Most powerful model, best for complex repositories' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast model, good for medium-sized repositories' },
  { value: 'claude-2', label: 'Claude 2', description: 'Strong analytical model with good code understanding' }
];

const NewConversion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useQuery();
  const repoIdFromQuery = query.get('repo');
  
  // Redux state
  const { repositories, selectedRepository, isLoading: repoLoading } = useSelector(state => state.repository);
  const { isLoading: conversionLoading } = useSelector(state => state.conversion);
  
  // Local state
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch repositories on component mount
  useEffect(() => {
    dispatch(fetchRepositories());
    
    // If repo ID is provided in URL, fetch that repository
    if (repoIdFromQuery) {
      dispatch(fetchRepositoryDetails(repoIdFromQuery));
    }
  }, [dispatch, repoIdFromQuery]);
  
  // Steps for the stepper
  const steps = ['Select Repository', 'Configure Output', 'Review & Create'];
  
  // Handle next step
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    setErrorMessage('');
    
    dispatch(createConversion(values))
      .unwrap()
      .then(response => {
        dispatch(openSnackbar({
          message: 'Conversion started successfully!',
          severity: 'success'
        }));
        navigate(`/conversions/${response.id}`);
      })
      .catch(err => {
        setErrorMessage(err.message || 'Failed to start conversion. Please try again.');
        setSubmitting(false);
      });
  };
  
  // Generate initial form values
  const initialValues = {
    repository_id: repoIdFromQuery || '',
    name: selectedRepository ? `${selectedRepository.name} Conversion` : '',
    description: '',
    output_format: 'markdown',
    output_type: 'standard',
    conversion_settings: {
      include_line_numbers: true,
      group_by_folder: true,
      include_file_paths: true
    },
    include_documentation: true,
    include_tests: false,
    include_todos: true,
    model: 'gpt-4'
  };
  
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
      
      <Typography variant="h4" gutterBottom component="h1">
        New Conversion
      </Typography>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Formik
          initialValues={initialValues}
          validationSchema={ValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
            <Form>
              {/* Step 1: Select Repository */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Select Repository
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Choose a repository to convert to text. Only repositories that have been analyzed can be converted.
                  </Typography>
                  
                  <FormControl fullWidth error={Boolean(touched.repository_id && errors.repository_id)} sx={{ mb: 3 }}>
                    <InputLabel id="repository-select-label">Repository</InputLabel>
                    <Field
                      as={Select}
                      name="repository_id"
                      labelId="repository-select-label"
                      value={values.repository_id}
                      label="Repository"
                      onChange={e => {
                        handleChange(e);
                        const repo = repositories.find(r => r.id === e.target.value);
                        if (repo) {
                          setFieldValue('name', `${repo.name} Conversion`);
                        }
                      }}
                      disabled={repoLoading}
                    >
                      {repositories
                        .filter(repo => repo.status === 'ready')
                        .map(repo => (
                          <MenuItem 
                            key={repo.id} 
                            value={repo.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <RepositoryIcon sx={{ mr: 1, fontSize: 20 }} color="primary" />
                            <Box>
                              <Typography variant="body1">
                                {repo.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {repo.file_count} files • {repo.languages?.length || 0} languages
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                    </Field>
                    {touched.repository_id && errors.repository_id && (
                      <Typography color="error" variant="caption">
                        {errors.repository_id}
                      </Typography>
                    )}
                    
                    {repoLoading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Loading repositories...
                        </Typography>
                      </Box>
                    )}
                  </FormControl>
                  
                  {values.repository_id && !repoLoading && selectedRepository && (
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <RepositoryIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">
                              {selectedRepository.name}
                            </Typography>
                            {selectedRepository.github_url && (
                              <Typography
                                variant="body2"
                                component="a"
                                href={selectedRepository.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: 'none', color: 'text.secondary' }}
                              >
                                {selectedRepository.github_url}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Files:
                            </Typography>
                            <Typography variant="body1">
                              {selectedRepository.file_count || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Languages:
                            </Typography>
                            <Typography variant="body1">
                              {selectedRepository.languages?.length || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Last Analyzed:
                            </Typography>
                            <Typography variant="body1">
                              {selectedRepository.last_analyzed_at ? 
                                new Date(selectedRepository.last_analyzed_at).toLocaleString() : 
                                'Never'}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        {selectedRepository.languages?.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Languages:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedRepository.languages.map(lang => (
                                <Chip
                                  key={lang.name}
                                  label={`${lang.name} (${lang.percentage}%)`}
                                  size="small"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Conversion Details
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="name"
                        label="Conversion Name"
                        fullWidth
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="description"
                        label="Description (optional)"
                        multiline
                        rows={3}
                        fullWidth
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && errors.description}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<NextIcon />}
                      onClick={handleNext}
                      disabled={!values.repository_id || repoLoading}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
              
              {/* Step 2: Configure Output */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Configure Output
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Customize how your code will be converted to text.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Output Format
                          </Typography>
                          
                          <FormControl fullWidth error={Boolean(touched.output_format && errors.output_format)} sx={{ mb: 3 }}>
                            <InputLabel id="format-select-label">Format</InputLabel>
                            <Field
                              as={Select}
                              name="output_format"
                              labelId="format-select-label"
                              value={values.output_format}
                              label="Format"
                              onChange={handleChange}
                            >
                              {outputFormats.map(format => (
                                <MenuItem key={format.value} value={format.value}>
                                  <Box>
                                    <Typography variant="body1">
                                      {format.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {format.description}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.output_format && errors.output_format && (
                              <Typography color="error" variant="caption">
                                {errors.output_format}
                              </Typography>
                            )}
                          </FormControl>
                          
                          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Output Type
                          </Typography>
                          
                          <FormControl fullWidth error={Boolean(touched.output_type && errors.output_type)} sx={{ mb: 3 }}>
                            <InputLabel id="type-select-label">Type</InputLabel>
                            <Field
                              as={Select}
                              name="output_type"
                              labelId="type-select-label"
                              value={values.output_type}
                              label="Type"
                              onChange={handleChange}
                            >
                              {outputTypes.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                  <Box>
                                    <Typography variant="body1">
                                      {type.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {type.description}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.output_type && errors.output_type && (
                              <Typography color="error" variant="caption">
                                {errors.output_type}
                              </Typography>
                            )}
                          </FormControl>
                          
                          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Language Model
                          </Typography>
                          
                          <FormControl fullWidth error={Boolean(touched.model && errors.model)} sx={{ mb: 3 }}>
                            <InputLabel id="model-select-label">Model</InputLabel>
                            <Field
                              as={Select}
                              name="model"
                              labelId="model-select-label"
                              value={values.model}
                              label="Model"
                              onChange={handleChange}
                            >
                              {languageModels.map(model => (
                                <MenuItem key={model.value} value={model.value}>
                                  <Box>
                                    <Typography variant="body1">
                                      {model.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {model.description}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.model && errors.model && (
                              <Typography color="error" variant="caption">
                                {errors.model}
                              </Typography>
                            )}
                          </FormControl>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Advanced Settings
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Content Options
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mb: 2 }}>
                            <FormControlLabel
                              control={
                                <Field
                                  as={Checkbox}
                                  name="include_documentation"
                                  checked={values.include_documentation}
                                  onChange={handleChange}
                                />
                              }
                              label="Include Documentation & Comments"
                            />
                            <FormControlLabel
                              control={
                                <Field
                                  as={Checkbox}
                                  name="include_tests"
                                  checked={values.include_tests}
                                  onChange={handleChange}
                                />
                              }
                              label="Include Test Files"
                            />
                            <FormControlLabel
                              control={
                                <Field
                                  as={Checkbox}
                                  name="include_todos"
                                  checked={values.include_todos}
                                  onChange={handleChange}
                                />
                              }
                              label="Include TODOs and Development Notes"
                            />
                          </FormControl>
                          
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Formatting Options
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mb: 2 }}>
                            <FormControlLabel
                              control={
                                <Field
                                  as={Checkbox}
                                  name="conversion_settings.include_line_numbers"
                                  checked={values.conversion_settings.include_line_numbers}
                                  onChange={handleChange}
                                />
                              }
                              label="Include Line Numbers"
                            />
                            <FormControlLabel
                              control={
                                <Field
                                  as={Checkbox}
                                  name="conversion_settings.group_by_folder"
                                  checked={values.conversion_settings.group_by_folder}
                                  onChange={handleChange}
                                />
                              }
                              label="Group Files by Folder"
                            />
                            <FormControlLabel
                              control={
                                <Field
                                  as={Checkbox}
                                  name="conversion_settings.include_file_paths"
                                  checked={values.conversion_settings.include_file_paths}
                                  onChange={handleChange}
                                />
                              }
                              label="Include File Paths"
                            />
                          </FormControl>
                          
                          {(values.output_type === 'detailed' || values.output_type === 'tutorial') && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                {values.output_type === 'detailed' ? 
                                  'Detailed output includes in-depth code analysis and may take longer to process.' : 
                                  'Tutorial format includes step-by-step explanations and is optimized for learning.'}
                              </Typography>
                            </Alert>
                          )}
                          
                          {values.model === 'gpt-4' && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                GPT-4 provides the highest quality results but may take longer to process.
                              </Typography>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<BackIcon />}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<NextIcon />}
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
              
              {/* Step 3: Review & Create */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review & Create
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Review your conversion settings before starting the process.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Repository
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          {selectedRepository && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <RepositoryIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
                              <Box>
                                <Typography variant="h6">
                                  {selectedRepository.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {selectedRepository.file_count || 0} files • {selectedRepository.languages?.length || 0} languages
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Conversion Details
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Name:
                              </Typography>
                              <Typography variant="body1">
                                {values.name}
                              </Typography>
                            </Grid>
                            {values.description && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                  Description:
                                </Typography>
                                <Typography variant="body1">
                                  {values.description}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Output Configuration
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Format:
                              </Typography>
                              <Typography variant="body1">
                                {outputFormats.find(f => f.value === values.output_format)?.label || values.output_format}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Type:
                              </Typography>
                              <Typography variant="body1">
                                {outputTypes.find(t => t.value === values.output_type)?.label || values.output_type}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Model:
                              </Typography>
                              <Typography variant="body1">
                                {languageModels.find(m => m.value === values.model)?.label || values.model}
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                            Content Options:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {values.include_documentation && (
                              <Chip label="Include Documentation" size="small" />
                            )}
                            {values.include_tests && (
                              <Chip label="Include Tests" size="small" />
                            )}
                            {values.include_todos && (
                              <Chip label="Include TODOs" size="small" />
                            )}
                          </Box>
                          
                          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                            Formatting Options:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {values.conversion_settings.include_line_numbers && (
                              <Chip label="Include Line Numbers" size="small" />
                            )}
                            {values.conversion_settings.group_by_folder && (
                              <Chip label="Group by Folder" size="small" />
                            )}
                            {values.conversion_settings.include_file_paths && (
                              <Chip label="Include File Paths" size="small" />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<BackIcon />}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<ConvertIcon />}
                      type="submit"
                      disabled={isSubmitting || conversionLoading}
                    >
                      {isSubmitting || conversionLoading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                          Starting Conversion...
                        </>
                      ) : (
                        'Start Conversion'
                      )}
                    </Button>
                  </Box>
                </Box>
              )}
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default NewConversion; 