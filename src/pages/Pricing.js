import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Pricing Plans
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          Choose the plan that fits your needs
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {/* Free tier */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom align="center">
                  Free
                </Typography>
                <Typography variant="h3" component="div" align="center" gutterBottom>
                  $0
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Up to 3 repositories" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Basic analysis" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="2-day trial of premium features" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                >
                  Sign Up
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          {/* Premium tier */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderColor: 'primary.main', 
              borderWidth: 2, 
              borderStyle: 'solid' 
            }}>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom align="center" color="primary">
                  Premium
                </Typography>
                <Typography variant="h3" component="div" align="center" gutterBottom>
                  $9.99
                </Typography>
                <Typography variant="caption" align="center" display="block">
                  per month
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited repositories" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Advanced analysis" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Google Drive integration" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Repository monitoring" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                >
                  Get Premium
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          {/* Enterprise tier */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom align="center">
                  Enterprise
                </Typography>
                <Typography variant="h3" component="div" align="center" gutterBottom>
                  Custom
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="All Premium features" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Team collaboration" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Custom integrations" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Priority support" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  component={Link} 
                  to="/contact" 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                >
                  Contact Us
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Pricing; 