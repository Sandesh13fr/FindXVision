import React from 'react';
import  { TextField, Box, Typography, IconButton, Card, CardContent, Grid }  from '@mui/material';
import { 
  Delete, 
  Add 
} from '@mui/icons-material';
import { Controller, useFieldArray } from 'react-hook-form';

import PrimaryButton from '../../Common/PrimaryButton';
const ContactsAdditionalInfo = ({ control }) => {
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: 'contacts',
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control,
    name: 'socialMedia',
  });

  return (
    <Box>
      {/* Medical Information Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Medical Information
          </Typography>
          <Controller
            name="medicalInfo.conditions"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Medical Conditions" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                placeholder="Any known medical conditions"
                helperText="List any medical conditions (optional)"
              />
            )}
          />
          <Controller
            name="medicalInfo.medications"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Medications" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                placeholder="Any medications currently taken"
                helperText="List current medications (optional)"
              />
            )}
          />
          <Controller
            name="medicalInfo.allergies"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Allergies" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                placeholder="Any known allergies"
                helperText="List any allergies (optional)"
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Additional Information Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          <Controller
            name="additionalInfo.hobbies"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Hobbies/Interests" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                placeholder="Favorite activities or interests"
                helperText="List hobbies or interests (optional)"
              />
            )}
          />
          <Controller
            name="additionalInfo.habits"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Habits" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                placeholder="Regular habits or routines"
                helperText="Describe regular habits (optional)"
              />
            )}
          />
          <Controller
            name="additionalInfo.frequentPlaces"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Frequent Places" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                placeholder="Places the person frequently visits"
                helperText="List frequently visited places (optional)"
              />
            )}
          />
          <Controller
            name="additionalInfo.recentChanges"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Recent Changes" 
                fullWidth 
                margin="normal" 
                multiline 
                rows={2}
                placeholder="Recent life changes or events"
                helperText="Any recent changes in behavior or life events (optional)"
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Contacts Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Emergency Contacts
          </Typography>
          {contactFields.map((field, index) => (
            <Card key={field.id} sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <Controller
                    name={`contacts.${index}.name`}
                    control={control}
                    rules={{ required: 'Contact name is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField 
                        {...field} 
                        label="Contact Name *" 
                        fullWidth 
                        error={!!error}
                        helperText={error ? error.message : ''}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    name={`contacts.${index}.phone`}
                    control={control}
                    rules={{ 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Phone must be 10 digits'
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField 
                        {...field} 
                        label="Phone Number *" 
                        fullWidth 
                        error={!!error}
                        helperText={error ? error.message : ''}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton 
                    onClick={() => removeContact(index)}
                    color="error"
                    sx={{ mt: 1 }}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Card>
          ))}
          <PrimaryButton
            startIcon={<Add />}
            onClick={() => appendContact({ name: '', phone: '' })}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Contact
          </PrimaryButton>
        </CardContent>
      </Card>

      {/* Social Media Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Social Media Accounts
          </Typography>
          {socialFields.map((field, index) => (
            <Card key={field.id} sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <Controller
                    name={`socialMedia.${index}.platform`}
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Platform" 
                        fullWidth 
                        placeholder="e.g., Facebook, Twitter, Instagram"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    name={`socialMedia.${index}.username`}
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Username/URL" 
                        fullWidth 
                        placeholder="Username or profile URL"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton 
                    onClick={() => removeSocial(index)}
                    color="error"
                    sx={{ mt: 1 }}
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Card>
          ))}
          <PrimaryButton
            startIcon={<Add />}
            onClick={() => appendSocial({ platform: '', username: '' })}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Social Media
          </PrimaryButton>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContactsAdditionalInfo;