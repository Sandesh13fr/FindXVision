import React from 'react';
import  { Container, Typography, Paper, Box }  from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PrimaryButton from '../../components/Common/PrimaryButton';
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          textAlign: 'center',
        }}
        component={Paper}
        elevation={3}
      >
        <Typography variant="h3" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" gutterBottom>
          Sorry, the page you are looking for does not exist.
        </Typography>
        <PrimaryButton variant="contained" color="primary" onClick={() => navigate("/")}>
          Go Home
        </PrimaryButton>
      </Box>
    </Container>
  );
};

export default NotFoundPage;

