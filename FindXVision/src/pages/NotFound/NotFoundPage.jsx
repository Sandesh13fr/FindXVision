import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../../components/Common/PrimaryButton';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fx-text-primary)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 4, md: 6 },
          width: '100%',
          textAlign: 'center',
          background: 'var(--fx-surface)',
          border: '1px solid var(--fx-border)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'var(--fx-accent-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          404 - Page Not Found
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            color: 'var(--fx-text-secondary)',
            mb: 4,
            maxWidth: 420,
            mx: 'auto',
          }}
        >
          Sorry, the page you’re looking for doesn’t exist or may have been moved.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PrimaryButton
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Return Home
          </PrimaryButton>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;

