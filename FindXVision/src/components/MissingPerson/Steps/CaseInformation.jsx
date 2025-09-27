import React from 'react';
import { TextField, Box, Card, CardContent, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';

const CaseInformation = ({ control }) => {
  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Case Information
          </Typography>
          <Controller
            name="caseInfo.caseTitle"
            control={control}
            rules={{ required: 'Case title is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField 
                {...field} 
                label="Case Title *" 
                fullWidth 
                margin="normal" 
                error={!!error}
                helperText={error ? error.message : 'Enter a descriptive title for this case'}
                required
              />
            )}
          />
          <Controller
            name="caseInfo.caseDescription"
            control={control}
            rules={{ required: 'Case description is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField 
                {...field} 
                label="Case Description *" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={4}
                placeholder="Provide a detailed description of the case"
                error={!!error}
                helperText={error ? error.message : 'Provide a comprehensive description of the situation'}
                required
              />
            )}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CaseInformation;