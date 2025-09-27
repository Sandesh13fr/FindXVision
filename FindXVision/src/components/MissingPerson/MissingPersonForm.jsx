import React, { useState } from 'react';
import  { Box, Card, CardContent, Typography, TextField, MenuItem, Alert, CircularProgress, Stack, Grid, Divider, Avatar }  from '@mui/material';
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
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" align="center" gutterBottom>
        Report a Missing Person
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Provide the details below to create a new report. Our team will review each submission before publishing it to the board.
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Person details
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Full name"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Phone number"
                    name="phoneNumber"
                    value={formValues.phoneNumber}
                    onChange={handleChange}
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleChange}
                    required
                    fullWidth
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
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Aadhaar number"
                    name="adhaarNumber"
                    value={formValues.adhaarNumber}
                    onChange={handleChange}
                    required
                    fullWidth
                    helperText="12-digit unique ID"
                  />
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={formValues.age}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="Height (cm)"
                    name="height"
                    type="number"
                    value={formValues.height}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
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
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Date missing"
                    name="dateMissing"
                    type="date"
                    value={formValues.dateMissing}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Last seen time"
                    name="lastSeenAt"
                    type="datetime-local"
                    value={formValues.lastSeenAt}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
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
                />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Last seen location
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click on the map or search for a place to set where the person was last seen.
              </Typography>
              <MapComponent
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation && { lat: selectedLocation.lat, lng: selectedLocation.lng }}
                height="320px"
              />
              {selectedLocation && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Selected location: {selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload recent photo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A clear and recent photo helps verify the report and improves visibility.
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar
                  src={imagePreview || undefined}
                  sx={{ width: 160, height: 160, bgcolor: 'grey.200', fontSize: 64 }}
                >
                  {!imagePreview && formValues.name?.charAt(0).toUpperCase()}
                </Avatar>
                <PrimaryButton
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
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
                  <Typography variant="caption" color="text.secondary">
                    {selectedImage.name}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <PrimaryButton
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                fullWidth
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit report'}
              </PrimaryButton>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MissingPersonForm;