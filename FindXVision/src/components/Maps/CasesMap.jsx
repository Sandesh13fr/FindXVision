import React, { useCallback, useEffect, useState } from 'react';
import  { Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider }  from '@mui/material';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

import PrimaryButton from '../Common/PrimaryButton';
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const CasesMap = ({
  cases,
  onCaseSelect,
  height = '500px',
  showClustering = true,
}) => {
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerIcon = (status, priority) => {
    let color = '#FF0000'; // Default red

    switch (status) {
      case 'OPEN':
        color = priority === 'URGENT' ? '#FF0000' : '#FF6600'; // Red or Orange
        break;
      case 'INVESTIGATING':
        color = '#FFAA00'; // Yellow/Orange
        break;
      case 'RESOLVED':
        color = '#00AA00'; // Green
        break;
      case 'CLOSED':
        color = '#888888'; // Gray
        break;
      default:
        break;
    }

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C10.48 2 6 6.48 6 12c0 7 10 18 10 18s10-11 10-18c0-5.52-4.48-10-10-10z" fill="${color}"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
          <circle cx="16" cy="12" r="2" fill="${color}"/>
        </svg>
      `),
    };
  };

  const handleMarkerClick = (caseItem) => {
    setSelectedMarker(caseItem.id);
    setSelectedCase(caseItem);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const handleViewDetails = () => {
    setDetailsOpen(true);
  };

  const handleGetDirections = (coordinates) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'error';
      case 'INVESTIGATING':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  // Fit map to show all markers
  useEffect(() => {
    if (map && cases.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      cases.forEach((caseItem) => {
        bounds.extend({
          lat: caseItem.latitude,
          lng: caseItem.longitude,
        });
      });
      map.fitBounds(bounds);
    }
  }, [map, cases]);

  const markers = cases.map((caseItem) => ({
    position: {
      lat: caseItem.latitude,
      lng: caseItem.longitude,
    },
    caseData: caseItem,
  }));

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Cases Map ({cases.length} cases)
      </Typography>

      <Box sx={{ height }}>
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
          libraries={['places']}
        >
          <GoogleMap
            mapContainerStyle={{ ...mapContainerStyle, height: '100%' }}
            zoom={10}
            center={defaultCenter}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.caseData.id}
                position={marker.position}
                title={marker.caseData.missingPersonName}
                icon={getMarkerIcon(marker.caseData.status, marker.caseData.priority)}
                onClick={() => handleMarkerClick(marker.caseData)}
              />
            ))}

            {selectedMarker && selectedCase && (
              <InfoWindow
                position={{
                  lat: selectedCase.latitude,
                  lng: selectedCase.longitude,
                }}
                onCloseClick={handleInfoWindowClose}
              >
                <div>
                  <Typography variant="subtitle1">
                    {selectedCase.missingPersonName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last seen: {formatDate(selectedCase.lastSeenDateTime)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Reported by: {selectedCase.reportedBy?.name || 'Unknown'}
                  </Typography>
                  <PrimaryButton
                    variant="contained"
                    color="primary"
                    onClick={() => handleGetDirections({
                      latitude: selectedCase.latitude,
                      longitude: selectedCase.longitude,
                    })}
                  >
                    Get Directions
                  </PrimaryButton>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Box>
    </>
  );
};

export default CasesMap;

