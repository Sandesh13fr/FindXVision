import React from 'react';
import  { Box, Typography, Card, CardContent, Grid, List, ListItem, ListItemText, Divider, Chip }  from '@mui/material';

import PrimaryButton from '../../Common/PrimaryButton';
const ReviewSubmit = ({ watch, onSubmit }) => {
  const formData = watch();

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Review Your Report
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Please review all information before submitting. You can go back to edit any details.
          </Typography>
          
          {/* Personal Information */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Personal Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Name:</Typography>
              <Typography>{formData.personalInfo?.name || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Age:</Typography>
              <Typography>{formData.personalInfo?.age || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Gender:</Typography>
              <Typography>{formData.personalInfo?.gender || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Adhaar Number:</Typography>
              <Typography>{formData.personalInfo?.adhaarNumber || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Phone:</Typography>
              <Typography>{formData.personalInfo?.phoneNumber || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Email:</Typography>
              <Typography>{formData.personalInfo?.email || 'Not provided'}</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Physical Description */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Physical Description</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Height:</Typography>
              <Typography>{formData.physicalDescription?.height ? `${formData.physicalDescription.height} cm` : 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Weight:</Typography>
              <Typography>{formData.physicalDescription?.weight ? `${formData.physicalDescription.weight} kg` : 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Eye Color:</Typography>
              <Typography>{formData.physicalDescription?.eyeColor || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Hair Color:</Typography>
              <Typography>{formData.physicalDescription?.hairColor || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Complexion:</Typography>
              <Typography>{formData.physicalDescription?.complexion || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Identifying Marks:</Typography>
              <Typography>{formData.physicalDescription?.identifyingMarks || 'Not provided'}</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Last Seen Details */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Last Seen Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Date:</Typography>
              <Typography>{formData.lastSeenDetails?.date || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Time:</Typography>
              <Typography>{formData.lastSeenDetails?.time || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Location:</Typography>
              <Typography>{formData.lastSeenDetails?.location || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Circumstances:</Typography>
              <Typography>{formData.lastSeenDetails?.circumstances || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Clothing Description:</Typography>
              <Typography>{formData.lastSeenDetails?.clothingDescription || 'Not provided'}</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Medical Information */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Medical Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Medical Conditions:</Typography>
              <Typography>{formData.medicalInfo?.conditions || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Medications:</Typography>
              <Typography>{formData.medicalInfo?.medications || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Allergies:</Typography>
              <Typography>{formData.medicalInfo?.allergies || 'Not provided'}</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Additional Information */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Additional Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Hobbies:</Typography>
              <Typography>{formData.additionalInfo?.hobbies || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Habits:</Typography>
              <Typography>{formData.additionalInfo?.habits || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Frequent Places:</Typography>
              <Typography>{formData.additionalInfo?.frequentPlaces || 'Not provided'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Recent Changes:</Typography>
              <Typography>{formData.additionalInfo?.recentChanges || 'Not provided'}</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Contacts */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Emergency Contacts</Typography>
          {formData.contacts && formData.contacts.length > 0 ? (
            <List>
              {formData.contacts.map((contact, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${contact.name} - ${contact.phone}`} 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No contacts provided</Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Social Media */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Social Media</Typography>
          {formData.socialMedia && formData.socialMedia.length > 0 ? (
            <List>
              {formData.socialMedia.map((social, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${social.platform}: ${social.username}`} 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No social media accounts provided</Typography>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <PrimaryButton 
              variant="contained" 
              color="primary" 
              onClick={onSubmit}
              size="large"
            >
              Submit Report
            </PrimaryButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReviewSubmit;