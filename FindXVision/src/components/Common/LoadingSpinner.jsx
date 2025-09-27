import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';



const LoadingSpinner = ({
  size = 40,
  message = 'Loading...',
  color = 'primary'
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;

