import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const MapPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Map feature retired
        </Typography>
        <Typography color="text.secondary">
          The interactive map has been removed. Please use the missing persons directory and case reports for the latest location updates.
        </Typography>
      </Box>
    </Container>
  );
};

export default MapPage;