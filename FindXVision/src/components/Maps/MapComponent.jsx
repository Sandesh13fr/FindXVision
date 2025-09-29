import React, { useState, useCallback } from 'react';
import  { Box, Card, CardContent, Typography, TextField, IconButton, Tooltip, Alert, Link }  from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import StaticMapPlaceholder from './StaticMapPlaceholder';

import PrimaryButton from '../Common/PrimaryButton';
// Define libraries as a constant to fix performance warning
const GOOGLE_MAPS_LIBRARIES = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const MapComponent = ({
  onLocationSelect,
  initialLocation,
  height = '400px',
  showSearch = true,
  markers = [],
}) => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
    setGeocoder(new window.google.maps.Geocoder());
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setGeocoder(null);
  }, []);

  const handleMapClick = useCallback((event) => {
    if (event.latLng) {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setSelectedLocation(location);
      
      // Reverse geocode to get address
      if (geocoder) {
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const locationWithAddress = {
              ...location,
              address: results[0].formatted_address
            };
            setSelectedLocation(locationWithAddress);
            onLocationSelect(locationWithAddress);
          } else {
            onLocationSelect(location);
          }
        });
      } else {
        onLocationSelect(location);
      }
    }
  }, [geocoder, onLocationSelect]);

  const handleSearchAddress = async () => {
    if (!geocoder || !searchAddress.trim()) return;

    setLoading(true);
    setError(null);

    geocoder.geocode({ address: searchAddress }, (results, status) => {
      setLoading(false);
      
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const locationData = {
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address
        };
        setSelectedLocation(locationData);
        onLocationSelect(locationData);
        
        if (map) {
          map.panTo(locationData);
          map.setZoom(15);
        }
      } else {
        setError('Location not found. Please try a different address.');
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSelectedLocation(location);
        
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }

        // Reverse geocode to get address
        if (geocoder) {
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const locationWithAddress = {
                ...location,
                address: results[0].formatted_address
              };
              setSelectedLocation(locationWithAddress);
              onLocationSelect(locationWithAddress);
            } else {
              onLocationSelect(location);
            }
          });
        } else {
          onLocationSelect(location);
        }
        
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setError('Failed to get current location: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setSearchAddress('');
    setError(null);
  };

  // Check if Google Maps API key is available
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'not_found';
  
  // If no API key, show static placeholder
  if (!googleMapsApiKey) {
    return (
      <Card className="fx-glass-card" sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'var(--fx-text-primary)' }}>
            Location Selection
          </Typography>
          
          {showSearch && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search for an address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                  InputProps={{
                    endAdornment: searchAddress && (
                      <IconButton size="small" onClick={() => setSearchAddress('')}>
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
                <PrimaryButton
                  variant="outlined"
                  onClick={handleSearchAddress}
                  disabled={loading || !searchAddress.trim()}
                  startIcon={<SearchIcon />}
                >
                  Search
                </PrimaryButton>
                <Tooltip title="Use current location">
                  <IconButton
                    color="primary"
                    onClick={getCurrentLocation}
                    disabled={loading}
                  >
                    <MyLocationIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {selectedLocation && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                    Selected: {selectedLocation?.address || (selectedLocation?.lat && `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`)}
                  </Typography>
                  <PrimaryButton size="small" onClick={clearSelection}>
                    Clear
                  </PrimaryButton>
                </Box>
              )}
            </Box>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(244, 67, 54, 0.12)',
                border: '1px solid rgba(244, 67, 54, 0.28)',
                color: 'var(--fx-text-primary)'
              }}
            >
              {error}
            </Alert>
          )}

          <StaticMapPlaceholder height={height} markers={markers} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fx-glass-card" sx={{ borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'var(--fx-text-primary)' }}>
          Location Selection
        </Typography>
        
        {showSearch && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search for an address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                InputProps={{
                  endAdornment: searchAddress && (
                    <IconButton size="small" onClick={() => setSearchAddress('')}>
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
              />
              <PrimaryButton
                variant="outlined"
                onClick={handleSearchAddress}
                disabled={loading || !searchAddress.trim()}
                startIcon={<SearchIcon />}
              >
                Search
              </PrimaryButton>
              <Tooltip title="Use current location">
                <IconButton
                  color="primary"
                  onClick={getCurrentLocation}
                  disabled={loading}
                >
                  <MyLocationIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {selectedLocation && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                  Selected: {selectedLocation?.address || (selectedLocation?.lat && `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`)}
                </Typography>
                <PrimaryButton size="small" onClick={clearSelection}>
                  Clear
                </PrimaryButton>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(244, 67, 54, 0.12)',
              border: '1px solid rgba(244, 67, 54, 0.28)',
              color: 'var(--fx-text-primary)'
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ height }}>
          <LoadScript
            googleMapsApiKey={googleMapsApiKey}
            libraries={GOOGLE_MAPS_LIBRARIES}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={10}
              center={selectedLocation || defaultCenter}
              onClick={handleMapClick}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                  draggable={true}
                  onDragEnd={(e) => {
                    const location = {
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng()
                    };
                    setSelectedLocation(location);
                    onLocationSelect(location);
                  }}
                />
              )}
              
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker.position}
                  title={marker.title}
                  onClick={() => setSelectedMarker(marker)}
                />
              ))}
              
              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.position}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div>
                    <h4>{selectedMarker.title}</h4>
                    {selectedMarker.description && <p>{selectedMarker.description}</p>}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </Box>
        
        <Box sx={{ mt: 1 }}>
          <Alert
            severity="info"
            sx={{
              py: 0,
              borderRadius: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.12)',
              border: '1px solid rgba(33, 150, 243, 0.28)',
              color: 'var(--fx-text-primary)'
            }}
          >
            Google Maps API Key: {googleMapsApiKey.substring(0, 10)}...{' '}
            <Link 
              href="https://developers.google.com/maps/documentation/javascript/error-messages#billing-not-enabled-map-error" 
              target="_blank" 
              rel="noopener noreferrer"
              variant="body2"
            >
              Troubleshoot API errors
            </Link>
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MapComponent;