import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const BasicInfoTab = ({ formData, updateFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Case Title"
          value={formData.title}
          onChange={(event) => handleChange('title', event.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Case Description"
          value={formData.description}
          onChange={(event) => handleChange('description', event.target.value)}
          error={Boolean(errors.description)}
          helperText={errors.description}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="case-priority-label">Priority</InputLabel>
          <Select
            labelId="case-priority-label"
            label="Priority"
            value={formData.priority}
            onChange={(event) => handleChange('priority', event.target.value)}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="URGENT">Urgent</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Police Report Number"
          value={formData.policeReportNumber || ''}
          onChange={(event) => handleChange('policeReportNumber', event.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Circumstances of Disappearance"
          value={formData.circumstances}
          onChange={(event) => handleChange('circumstances', event.target.value)}
          error={Boolean(errors.circumstances)}
          helperText={errors.circumstances}
          required
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfoTab;
