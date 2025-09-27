import React, { useState } from 'react';
import  { Box, Card, CardContent, Typography, Grid, Chip, IconButton, Menu, MenuItem }  from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DirectionsIcon from '@mui/icons-material/Directions';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';

import PrimaryButton from '../Common/PrimaryButton';
const CaseMapView = ({
  cases,
  onCaseSelect,
  onGetDirections,
}) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event, caseItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedCase(caseItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewCase = () => {
    if (selectedCase) {
      onCaseSelect(selectedCase.id);
    }
    handleMenuClose();
  };
  const handleGetDirections = () => {
    if (selectedCase) {
      onGetDirections(selectedCase.lastSeenLocation.coordinates);
    }
    handleMenuClose();
  };
  const handleShareLocation = () => {
    if (selectedCase) {
      const { latitude, longitude } = selectedCase.lastSeenLocation.coordinates;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      if (navigator.share) {
        navigator.share({
          title: 'Case Location',
          url: mapsUrl,
        });
      } else {
        navigator.clipboard.writeText(mapsUrl);
        // You could show a toast notification here
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Case Locations
      </Typography>
      <Grid container spacing={2}>
        {cases.map((caseItem) => (
          <Grid item xs={12} sm={6} md={4} key={caseItem.id}>
            <Card sx={{ position: 'relative' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {caseItem.missingPersonName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Case #{caseItem.caseNumber}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {caseItem.title}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, caseItem)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {caseItem.lastSeenLocation.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={caseItem.status}
                    color={getStatusColor(caseItem.status)}
                    size="small"
                  />
                  <Chip
                    label={caseItem.priority}
                    color={getPriorityColor(caseItem.priority)}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Last seen: {formatDate(caseItem.lastSeenDateTime)}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <PrimaryButton
                    size="small"
                    variant="outlined"
                    startIcon={<DirectionsIcon />}
                    onClick={() => onGetDirections(caseItem.lastSeenLocation.coordinates)}
                  >
                    Directions
                  </PrimaryButton>
                  <PrimaryButton
                    size="small"
                    variant="text"
                    onClick={() => onCaseSelect(caseItem.id)}
                  >
                    View Case
                  </PrimaryButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {cases.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocationOnIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No case locations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cases with location data will appear here
          </Typography>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewCase}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Case
        </MenuItem>
        <MenuItem onClick={handleGetDirections}>
          <DirectionsIcon sx={{ mr: 1 }} />
          Get Directions
        </MenuItem>
        <MenuItem onClick={handleShareLocation}>
          <ShareIcon sx={{ mr: 1 }} />
          Share Location
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CaseMapView;

