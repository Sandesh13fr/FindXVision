import React from 'react';
import { Grid, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const defaultLocation = {
  address: '',
  city: '',
  state: '',
  country: '',
  latitude: '',
  longitude: '',
};

const LocationTab = ({ formData, updateFormData, errors, setErrors }) => {
  const location = {
    ...defaultLocation,
    ...(formData.lastSeenLocation || {}),
  };

  const handleLocationChange = (field, value) => {
    updateFormData({
      lastSeenLocation: {
        ...location,
        [field]: value,
      },
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateTimeChange = (value) => {
    updateFormData({ lastSeenDateTime: value ? value.toISOString() : '' });

    if (errors.lastSeenDateTime) {
      setErrors((prev) => ({ ...prev, lastSeenDateTime: '' }));
    }
  };

  const pickerValue = formData.lastSeenDateTime ? new Date(formData.lastSeenDateTime) : null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Last Seen Date & Time"
            value={pickerValue}
            onChange={handleDateTimeChange}
            slotProps={{
              textField: {
                fullWidth: true,
                error: Boolean(errors.lastSeenDateTime),
                helperText: errors.lastSeenDateTime,
                required: true,
              },
            }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          value={location.address}
          onChange={(event) => handleLocationChange('address', event.target.value)}
          error={Boolean(errors.address)}
          helperText={errors.address}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={location.city}
          onChange={(event) => handleLocationChange('city', event.target.value)}
          error={Boolean(errors.city)}
          helperText={errors.city}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State / Province"
          value={location.state}
          onChange={(event) => handleLocationChange('state', event.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          value={location.country}
          onChange={(event) => handleLocationChange('country', event.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="Latitude"
          type="number"
          value={location.latitude}
          onChange={(event) => handleLocationChange('latitude', event.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <TextField
          fullWidth
          label="Longitude"
          type="number"
          value={location.longitude}
          onChange={(event) => handleLocationChange('longitude', event.target.value)}
        />
      </Grid>
    </Grid>
  );
};

export default LocationTab;

