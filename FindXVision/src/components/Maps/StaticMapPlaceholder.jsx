import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';

const StaticMapPlaceholder = ({ height = '400px', markers = [] }) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  // If API key is available, show a message about dynamic maps
  if (googleMapsApiKey) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ 
            height, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'grey.100',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'grey.300'
          }}>
            <MapIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" align="center">
              Google Maps Integration Active
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Map component would be rendered here with API key: {googleMapsApiKey.substring(0, 10)}...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // If no API key, show a static placeholder with instructions
  return (
    <Card>
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Google Maps API key not configured.{' '}
          <Link 
            href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Get your API key
          </Link>{' '}
          to enable interactive maps.
        </Alert>
        
        <Box sx={{ 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'grey.300'
        }}>
          <MapIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" align="center">
            Map Placeholder
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Interactive map would appear here with a valid Google Maps API key
          </Typography>
          
          <Box sx={{ mt: 3, textAlign: 'left', width: '80%' }}>
            <Typography variant="subtitle2" gutterBottom>
              To enable Google Maps:
            </Typography>
            <Typography variant="body2" component="div">
              <ol>
                <li>Create a Google Cloud project</li>
                <li>Enable the Maps JavaScript API</li>
                <li>Enable billing for your project</li>
                <li>Create an API key</li>
                <li>Add the key to your <code>.env</code> file as <code>REACT_APP_GOOGLE_MAPS_API_KEY</code></li>
              </ol>
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StaticMapPlaceholder;