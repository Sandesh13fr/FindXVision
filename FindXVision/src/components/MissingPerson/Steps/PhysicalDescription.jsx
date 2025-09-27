import React from 'react';
import { TextField, Box, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

const eyeColorOptions = ["Blue", "Brown", "Green", "Hazel", "Gray", "Amber", "Other"];
const hairColorOptions = ["Black", "Brown", "Blonde", "Red", "Gray", "White", "Other"];
const complexionOptions = ["Fair", "Medium", "Olive", "Brown", "Dark", "Other"];

const PhysicalDescription = ({ control }) => {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="physicalDescription.height"
            control={control}
            rules={{ 
              min: { value: 50, message: 'Height must be realistic' },
              max: { value: 250, message: 'Height must be realistic' }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField 
                {...field} 
                label="Height (cm)" 
                fullWidth 
                margin="normal" 
                type="number"
                error={!!error}
                helperText={error ? error.message : 'Enter height in centimeters (optional)'}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="physicalDescription.weight"
            control={control}
            rules={{ 
              min: { value: 1, message: 'Weight must be realistic' },
              max: { value: 300, message: 'Weight must be realistic' }
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField 
                {...field} 
                label="Weight (kg)" 
                fullWidth 
                margin="normal" 
                type="number"
                error={!!error}
                helperText={error ? error.message : 'Enter weight in kilograms (optional)'}
              />
            )}
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Controller
            name="physicalDescription.eyeColor"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel>Eye Color</InputLabel>
                <Select 
                  {...field}
                  label="Eye Color"
                >
                  {eyeColorOptions.map(color => (
                    <MenuItem key={color} value={color.toLowerCase()}>{color}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="physicalDescription.hairColor"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel>Hair Color</InputLabel>
                <Select 
                  {...field}
                  label="Hair Color"
                >
                  {hairColorOptions.map(color => (
                    <MenuItem key={color} value={color.toLowerCase()}>{color}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="physicalDescription.complexion"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel>Complexion</InputLabel>
                <Select 
                  {...field}
                  label="Complexion"
                >
                  {complexionOptions.map(type => (
                    <MenuItem key={type} value={type.toLowerCase()}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
      
      <Controller
        name="physicalDescription.identifyingMarks"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField 
            {...field} 
            label="Identifying Marks" 
            fullWidth 
            margin="normal" 
            multiline 
            rows={3}
            placeholder="Scars, tattoos, birthmarks, etc."
            helperText="Describe any distinguishing features (optional)"
          />
        )}
      />
    </Box>
  );
};

export default PhysicalDescription;