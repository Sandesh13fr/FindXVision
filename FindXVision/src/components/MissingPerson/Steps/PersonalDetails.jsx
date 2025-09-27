import React from 'react';
import { TextField, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

const PersonalDetails = ({ control }) => {
  return (
    <Box>
      <Controller
        name="personalInfo.name"
        control={control}
        rules={{ required: 'Full name is required' }}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Full Name *" 
            fullWidth 
            margin="normal" 
            error={!!error}
            helperText={error ? error.message : 'Enter the full name of the missing person'}
            required
          />
        )}
      />
      <Controller
        name="personalInfo.age"
        control={control}
        rules={{ 
          required: 'Age is required',
          min: { value: 1, message: 'Age must be at least 1' },
          max: { value: 120, message: 'Age must be realistic' }
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Age *" 
            fullWidth 
            margin="normal" 
            type="number" 
            error={!!error}
            helperText={error ? error.message : 'Enter the age of the missing person'}
            required
          />
        )}
      />
      <Controller
        name="personalInfo.gender"
        control={control}
        rules={{ required: 'Gender is required' }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth margin="normal" error={!!error} required>
            <InputLabel>Gender *</InputLabel>
            <Select 
              {...field}
              label="Gender *"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />
      <Controller
        name="personalInfo.adhaarNumber"
        control={control}
        rules={{ 
          required: 'Adhaar number is required',
          pattern: {
            value: /^\d{12}$/,
            message: 'Adhaar number must be exactly 12 digits'
          }
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Adhaar Number *" 
            fullWidth 
            margin="normal" 
            error={!!error}
            helperText={error ? error.message : 'Enter the 12-digit Adhaar number'}
            required
          />
        )}
      />
      <Controller
        name="personalInfo.phoneNumber"
        control={control}
        rules={{ 
          pattern: {
            value: /^\d{10}$/,
            message: 'Phone number must be exactly 10 digits'
          }
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Phone Number" 
            fullWidth 
            margin="normal" 
            error={!!error}
            helperText={error ? error.message : 'Enter a 10-digit phone number (optional)'}
          />
        )}
      />
      <Controller
        name="personalInfo.email"
        control={control}
        rules={{ 
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
          }
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Email" 
            fullWidth 
            margin="normal" 
            type="email" 
            error={!!error}
            helperText={error ? error.message : 'Enter email address (optional)'}
          />
        )}
      />
    </Box>
  );
};

export default PersonalDetails;