import React, { useState } from 'react';
import  { Box, Typography, TextField, MenuItem, Alert, CircularProgress, Stack, Grid, Divider, Avatar, Chip }  from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import MapComponent from '../Maps/MapComponent';
import { casesAPI } from '../../services/api';

import PrimaryButton from '../Common/PrimaryButton';
const initialFormState = {
  name: '',
  email: '',
  gender: 'male',
  adhaarNumber: '',
  phoneNumber: '',
  address: '',
  dateMissing: '',
  lastSeenAt: '',
  lastSeenNotes: '',
  nationality: 'Indian',
  height: '',
  age: '',
};

const MissingPersonForm = () => {
  const [formValues, setFormValues] = useState(initialFormState);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fieldStyles = {
    '& .MuiInputLabel-root': {
      color: 'var(--fx-text-secondary)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderRadius: 1.5,
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.16)',
      },
      '&:hover fieldset': {
        borderColor: 'var(--fx-accent)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--fx-accent)',
      },
      '& .MuiInputBase-input': {
        color: 'var(--fx-text-primary)',
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#ffb74d',
    },
  };

  const sectionStyles = {
    background: 'rgba(20, 20, 20, 0.58)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: 3,
    boxShadow: '0 28px 80px rgba(0, 0, 0, 0.38)',
    p: { xs: 3.5, md: 5 },
    position: 'relative',
    overflow: 'hidden',
  };

  const sectionHeader = (label, title, description) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        pb: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Box>
        <Typography variant="overline" sx={{ color: 'var(--fx-accent)', letterSpacing: '0.28em' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {description && (
        <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)', maxWidth: 360 }}>
          {description}
        </Typography>
      )}
    </Box>
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'error', message: 'Please upload a valid image file.' });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (location?.address) {
      setFormValues((prev) => ({ ...prev, address: prev.address || location.address }));
    }
  };

  const resetForm = () => {
    setFormValues(initialFormState);
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedLocation(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAlert(null);

    if (!selectedLocation) {
      setAlert({ type: 'error', message: 'Please select the last seen location on the map.' });
      return;
    }

    if (!selectedImage) {
      setAlert({ type: 'error', message: 'Please upload a recent photo of the missing person.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          payload.append(key, value);
        }
      });

      payload.append('image', selectedImage);
      payload.append('lastSeenLocation', JSON.stringify({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: selectedLocation.address || formValues.address,
      }));

      const response = await casesAPI.createCase(payload);

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Missing person report submitted successfully. Awaiting admin approval.' });
        resetForm();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit missing person report.';
      setAlert({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1240, mx: 'auto', py: { xs: 5, md: 7 }, px: { xs: 2.5, md: 4 } }}>
      <Stack spacing={3.5} alignItems={{ xs: 'flex-start', md: 'center' }} textAlign={{ xs: 'left', md: 'center' }}>
        <Chip
          label="Missing person intake"
          color="warning"
          variant="outlined"
          sx={{
            alignSelf: { xs: 'flex-start', md: 'center' },
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            borderColor: 'rgba(255, 152, 0, 0.35)',
            color: 'var(--fx-accent)',
            backgroundColor: 'rgba(255, 152, 0, 0.12)',
            fontWeight: 600,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Report a Missing Person
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 640,
            color: 'var(--fx-text-secondary)',
          }}
        >
          Provide verified details so investigators can authenticate the case quickly. Every field strengthens
          the search narrative and reduces response time.
        </Typography>
      </Stack>

      {alert && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert(null)}
          sx={{
            mt: 4,
            borderRadius: 2,
            border: '1px solid rgba(255, 152, 0, 0.35)',
            backgroundColor: 'rgba(255, 152, 0, 0.15)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            color: 'var(--fx-text-primary)',
          }}
        >
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={4} component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Grid item xs={12} md={7}>
          <Stack spacing={3.5}>
            <Box sx={sectionStyles}>
              {sectionHeader(
                'Identity verification',
                'Person details & personal identifiers',
                'Validate the individual so responders can confirm they are tracking the correct person.',
              )}
              <Stack spacing={3}>
                <TextField
                  label="Full name"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={fieldStyles}
                />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2.5}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', '& > *': { flex: '1 1 240px' } }}
                >
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                    fullWidth
                    sx={fieldStyles}
                  />
                  <TextField
                    label="Phone number"
                    name="phoneNumber"
                    value={formValues.phoneNumber}
                    onChange={handleChange}
                    fullWidth
                    sx={fieldStyles}
                  />
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2.5}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', '& > *': { flex: '1 1 220px' } }}
                >
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={fieldStyles}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                  <TextField
                    label="Nationality"
                    name="nationality"
                    value={formValues.nationality}
                    onChange={handleChange}
                    fullWidth
                    sx={fieldStyles}
                  />
                </Stack>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2.5}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', '& > *': { flex: '1 1 200px' } }}
                >
                  <TextField
                    label="Aadhaar number"
                    name="adhaarNumber"
                    value={formValues.adhaarNumber}
                    onChange={handleChange}
                    required
                    fullWidth
                    helperText="12-digit unique ID"
                    sx={fieldStyles}
                  />
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={formValues.age}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    sx={fieldStyles}
                  />
                  <TextField
                    label="Height (cm)"
                    name="height"
                    type="number"
                    value={formValues.height}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    sx={fieldStyles}
                  />
                </Stack>
                <TextField
                  label="Home address"
                  name="address"
                  value={formValues.address}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  minRows={2}
                  sx={fieldStyles}
                />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2.5}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', '& > *': { flex: '1 1 200px' } }}
                >
                  <TextField
                    label="Date missing"
                    name="dateMissing"
                    type="date"
                    value={formValues.dateMissing}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyles}
                  />
                  <TextField
                    label="Last seen time"
                    name="lastSeenAt"
                    type="datetime-local"
                    value={formValues.lastSeenAt}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyles}
                  />
                </Stack>
                <TextField
                  label="Last seen notes"
                  name="lastSeenNotes"
                  value={formValues.lastSeenNotes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={3}
                  helperText="Describe what happened when the person was last seen"
                  sx={fieldStyles}
                />
              </Stack>
            </Box>

            <Box sx={{ ...sectionStyles, mt: { xs: 0, md: 1 } }}>
              {sectionHeader(
                'Field operations',
                'Last seen location',
                'Pinpoint the final confirmed location so search teams can sequence canvassing zones.',
              )}
              <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)', mb: 2 }}>
                Click on the map or search for a location to drop the marker. Coordinates are saved with the report
                once you submit.
              </Typography>
              <MapComponent
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation && { lat: selectedLocation.lat, lng: selectedLocation.lng }}
                height="320px"
              />
              {selectedLocation && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 2.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(3, 169, 244, 0.12)',
                    border: '1px solid rgba(3, 169, 244, 0.35)',
                  }}
                >
                  Selected location: {selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                </Alert>
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box
            sx={{
              ...sectionStyles,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              {sectionHeader(
                'Visual confirmation',
                'Upload recent photo',
                'High-quality imagery speeds up verification and sighting confirmation.',
              )}
              <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                Supported formats: JPG, PNG. Aim for a clear frontal photo taken within the last 12 months.
              </Typography>
              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  width: '100%',
                }}
              >
                <Avatar
                  src={imagePreview || undefined}
                  sx={{
                    width: 180,
                    height: 180,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    fontSize: 72,
                    border: '2px solid rgba(255, 152, 0, 0.35)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  {!imagePreview && formValues.name?.charAt(0).toUpperCase()}
                </Avatar>
                <PrimaryButton
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  size="large"
                >
                  {selectedImage ? 'Change photo' : 'Upload photo'}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleImageUpload}
                  />
                </PrimaryButton>
                {selectedImage && (
                  <Typography variant="caption" sx={{ color: 'var(--fx-text-secondary)' }}>
                    {selectedImage.name}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 3 }} />

            <PrimaryButton
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Submit report'}
            </PrimaryButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MissingPersonForm;