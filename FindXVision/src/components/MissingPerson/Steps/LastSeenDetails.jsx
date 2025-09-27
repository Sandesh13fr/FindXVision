import React from 'react';
import { TextField, Box, Grid, FormControl, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

const LastSeenDetails = ({ control }) => {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="lastSeenDetails.date"
            control={control}
            rules={{ required: 'Date is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField 
                {...field} 
                label="Date *" 
                fullWidth 
                margin="normal" 
                type="date" 
                InputLabelProps={{ shrink: true }} 
                error={!!error}
                helperText={error ? error.message : 'Select the date when the person was last seen'}
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="lastSeenDetails.time"
            control={control}
            rules={{ required: 'Time is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField 
                {...field} 
                label="Time *" 
                fullWidth 
                margin="normal" 
                type="time" 
                InputLabelProps={{ shrink: true }} 
                error={!!error}
                helperText={error ? error.message : 'Select the time when the person was last seen'}
                required
              />
            )}
          />
        </Grid>
      </Grid>
      
      <Controller
        name="lastSeenDetails.location"
        control={control}
        rules={{ required: 'Location is required' }}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Location *" 
            fullWidth 
            margin="normal" 
            error={!!error}
            helperText={error ? error.message : 'Enter the location where the person was last seen'}
            required
          />
        )}
      />
      
      <Controller
        name="lastSeenDetails.circumstances"
        control={control}
        rules={{ required: 'Circumstances are required' }}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Circumstances *" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={4}
            placeholder="Describe what happened when the person was last seen"
            error={!!error}
            helperText={error ? error.message : 'Provide details about the circumstances of disappearance'}
            required
          />
        )}
      />
      
      <Controller
        name="lastSeenDetails.clothingDescription"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Clothing Description" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            placeholder="Describe what the person was wearing"
            helperText="Describe the clothing worn when last seen (optional)"
          />
        )}
      />
    </Box>
  );
};

export default LastSeenDetails;