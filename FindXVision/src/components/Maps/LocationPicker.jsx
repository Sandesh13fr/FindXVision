import React, { useState, useCallback } from 'react';
import  { Box, IconButton, Tooltip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Switch, TextField, Typography }  from '@mui/material';
import {
  GoogleMap,
  LoadScript,
  Marker,
} from '@react-google-maps/api';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import PrimaryButton from '../Common/PrimaryButton';
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const LocationPicker = ({
  onLocationSelect,
  initialLocation,
  buttonText = 'Select Location on Map',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [searchAddress, setSearchAddress] = useState('');
  const [geocoder, setGeocoder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrentLocation, setShowCurrentLocation] = useState(true);

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
        lng: event.latLng.lng(),
      };
      setSelectedLocation(location);

      if (geocoder) {
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setSelectedLocation({
              ...location,
              address: results[0].formatted_address,
            });
          }
        });
      }
    }
  }, [geocoder]);

  const handleSearchAddress = () => {
    if (!geocoder || !searchAddress.trim()) return;

    setLoading(true);
    setError(null);

    geocoder.geocode({ address: searchAddress }, (results, status) => {
      setLoading(false);

      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const locationData = {
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address,
        };
        setSelectedLocation(locationData);

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
          lng: position.coords.longitude,
        };
        setSelectedLocation(location);

        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }

        if (geocoder) {
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setSelectedLocation({
                ...location,
                address: results[0].formatted_address,
              });
            }
          });
        }

        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setError('Failed to get current location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setSearchAddress('');
    setError(null);
  };

  return (
    <>
      <PrimaryButton
        variant="outlined"
        startIcon={<MapIcon />}
        onClick={() => setOpen(true)}
        disabled={disabled}
        fullWidth
      >
        {buttonText}
      </PrimaryButton>

      {selectedLocation && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Selected: {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
          </Typography>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Select Location
          <FormControlLabel
            control={
              <Switch
                checked={showCurrentLocation}
                onChange={(e) => setShowCurrentLocation(e.target.checked)}
                size="small"
              />
            }
            label="Show current location"
            sx={{ float: 'right' }}
          />
        </DialogTitle>
        <DialogContent>
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
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                </Typography>
                <PrimaryButton size="small" onClick={clearSelection}>
                  Clear
                </PrimaryButton>
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ height: 400 }}>
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDyyWpDaW8kF0RAfJi_cAr0Q_4dUGTjIzY'}
              libraries={['places']}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={selectedLocation ? 15 : 10}
                center={selectedLocation || initialLocation || defaultCenter}
                onClick={handleMapClick}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {selectedLocation && (
                  <Marker
                    position={selectedLocation}
                    title="Selected Location"
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </Box>
        </DialogContent>
        <DialogActions>
          <PrimaryButton onClick={handleClose}>Cancel</PrimaryButton>
          <PrimaryButton onClick={handleConfirm} disabled={!selectedLocation}>
            Confirm
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LocationPicker;

