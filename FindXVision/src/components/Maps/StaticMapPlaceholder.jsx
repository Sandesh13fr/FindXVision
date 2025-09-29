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
      <Card className="fx-glass-card" sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ 
            height, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 3,
            border: '1px dashed rgba(255, 255, 255, 0.18)',
            color: 'var(--fx-text-primary)',
            textAlign: 'center'
          }}>
            <MapIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'var(--fx-text-primary)' }}>
              Google Maps Integration Active
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)', mt: 1 }}>
              Map component would be rendered here with API key: {googleMapsApiKey.substring(0, 10)}...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // If no API key, show a static placeholder with instructions
  return (
    <Card className="fx-glass-card" sx={{ borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Alert
          severity="info"
          sx={{
            mb: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(33, 150, 243, 0.12)',
            color: 'var(--fx-text-primary)',
            border: '1px solid rgba(33, 150, 243, 0.25)'
          }}
        >
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
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 3,
          border: '1px dashed rgba(255, 255, 255, 0.18)',
          color: 'var(--fx-text-primary)',
          textAlign: 'center'
        }}>
          <MapIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.65)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'var(--fx-text-primary)' }}>
            Map Placeholder
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)', mt: 1 }}>
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