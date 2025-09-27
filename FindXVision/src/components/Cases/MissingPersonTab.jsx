import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, PhotoCamera as PhotoCameraIcon, Delete as DeleteIcon } from '@mui/icons-material';

import PrimaryButton from '../Common/PrimaryButton';

const defaultMissingPerson = {
  firstName: '',
  lastName: '',
  age: '',
  gender: 'unknown',
  height: '',
  weight: '',
  eyeColor: '',
  hairColor: '',
  description: '',
  medicalConditions: [],
  photos: [],
};

const MissingPersonTab = ({ formData, updateFormData, errors, setErrors }) => {
  const [conditionInput, setConditionInput] = useState('');

  const missingPerson = {
    ...defaultMissingPerson,
    ...(formData.missingPerson || {}),
  };

  const handleFieldChange = (field, value) => {
    updateFormData({
      missingPerson: {
        ...missingPerson,
        [field]: value,
      },
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addCondition = () => {
    const trimmed = conditionInput.trim();
    if (!trimmed) return;

    handleFieldChange('medicalConditions', [...missingPerson.medicalConditions, trimmed]);
    setConditionInput('');
  };

  const removeCondition = (condition) => {
    handleFieldChange(
      'medicalConditions',
      missingPerson.medicalConditions.filter((item) => item !== condition)
    );
  };

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    const nextPhotos = acceptedFiles.map((file) => ({
      name: file.name,
      preview: URL.createObjectURL(file),
      file,
    }));

    handleFieldChange('photos', [...(missingPerson.photos || []), ...nextPhotos]);
  };

  const removePhoto = (index) => {
    const nextPhotos = (missingPerson.photos || []).filter((_, photoIndex) => photoIndex !== index);
    handleFieldChange('photos', nextPhotos);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={missingPerson.firstName}
          onChange={(event) => handleFieldChange('firstName', event.target.value)}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={missingPerson.lastName}
          onChange={(event) => handleFieldChange('lastName', event.target.value)}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName}
          required
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          type="number"
          label="Age"
          value={missingPerson.age}
          onChange={(event) => handleFieldChange('age', event.target.value)}
          error={Boolean(errors.age)}
          helperText={errors.age}
          required
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel id="missing-person-gender-label">Gender</InputLabel>
          <Select
            labelId="missing-person-gender-label"
            label="Gender"
            value={missingPerson.gender}
            onChange={(event) => handleFieldChange('gender', event.target.value)}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="non-binary">Non-binary</MenuItem>
            <MenuItem value="unknown">Prefer not to say</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          type="number"
          label="Height (cm)"
          value={missingPerson.height}
          onChange={(event) => handleFieldChange('height', event.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Weight (kg)"
          value={missingPerson.weight}
          onChange={(event) => handleFieldChange('weight', event.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Eye Color"
          value={missingPerson.eyeColor}
          onChange={(event) => handleFieldChange('eyeColor', event.target.value)}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Hair Color"
          value={missingPerson.hairColor}
          onChange={(event) => handleFieldChange('hairColor', event.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Physical Description"
          value={missingPerson.description}
          onChange={(event) => handleFieldChange('description', event.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Medical Conditions
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextField
            label="Add condition"
            value={conditionInput}
            onChange={(event) => setConditionInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCondition();
              }
            }}
            size="small"
          />
          <PrimaryButton variant="outlined" onClick={addCondition} startIcon={<AddIcon />}>
            Add
          </PrimaryButton>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {missingPerson.medicalConditions.map((condition) => (
            <Chip key={condition} label={condition} onDelete={() => removeCondition(condition)} />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Photos
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          }}
        >
          <input {...getInputProps()} />
          <PhotoCameraIcon color={isDragActive ? 'primary' : 'action'} sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Drag and drop photos here, or click to select files
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {(missingPerson.photos || []).map((photo, index) => (
            <Box key={`${photo.name}-${index}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar src={photo.preview || photo.url} alt={photo.name} sx={{ width: 80, height: 80 }} />
              <Typography variant="caption" sx={{ maxWidth: 100 }} noWrap>
                {photo.name}
              </Typography>
              <IconButton size="small" color="error" onClick={() => removePhoto(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default MissingPersonTab;

