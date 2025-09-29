import React from 'react';
import { Box, Container, Typography, Card, CardContent, IconButton, Stack } from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../Common/PrimaryButton';

const Hero = () => {
  const navigate = useNavigate();

  const handleReportMissing = () => {
    navigate('/report');
  };

  const handleSearchMissing = () => {
    navigate('/missing-persons');
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          color: 'var(--fx-text-primary)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  color: 'var(--fx-text-primary)',
                }}
              >
              A Vision for the Missing, A Path to Home.
              </Typography>
              <Typography
                variant="h5"
                component="p"
                sx={{
                  mb: 4,
                  opacity: 0.85,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  lineHeight: 1.6,
                  color: 'var(--fx-text-secondary)',
                }}
              >
                A comprehensive platform to help locate missing persons through
                community collaboration, advanced search tools, and real-time updates.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ flexWrap: 'no-wrap' }}
              >
                <PrimaryButton
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleReportMissing}
                >
                  Report Missing Person
                </PrimaryButton>
                <PrimaryButton
                  variant="outlined"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={handleSearchMissing}
                >
                  Search Missing Persons
                </PrimaryButton>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  mx: 'auto',
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 152, 0, 0.25)',
                  backgroundColor: 'rgba(33, 33, 33, 0.85)',
                }}
              >
                <Box
                  component="img"
                  src="/team.jpg"
                  alt="FindXVision team collaborating"
                  sx={{
                    width: '100%',
                    display: 'block',
                  }}
                />

                {/* Corner brackets */}
                {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => {
                  const positions = {
                    topLeft: { top: 24, left: 24, borderTop: '3px solid #ff9800', borderLeft: '3px solid #ff9800' },
                    topRight: { top: 24, right: 24, borderTop: '3px solid #ff9800', borderRight: '3px solid #ff9800' },
                    bottomLeft: { bottom: 24, left: 24, borderBottom: '3px solid #ff9800', borderLeft: '3px solid #ff9800' },
                    bottomRight: { bottom: 24, right: 24, borderBottom: '3px solid #ff9800', borderRight: '3px solid #ff9800' },
                  };
                  return (
                    <Box
                      key={corner}
                      sx={{
                        position: 'absolute',
                        width: { xs: 32, md: 48 },
                        height: { xs: 32, md: 48 },
                        borderRadius: 0,
                        ...positions[corner],
                      }}
                    />
                  );
                })}

                {/* Scanner line */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: { xs: 10, md: 16 },
                    background:
                      'linear-gradient(90deg, rgba(255, 152, 0, 0) 0%, rgba(255, 152, 0, 0.55) 40%, rgba(255, 152, 0, 0.9) 50%, rgba(255, 152, 0, 0.55) 60%, rgba(255, 152, 0, 0) 100%)',
                    boxShadow: '0 0 28px 6px rgba(255, 152, 0, 0.35)',
                    mixBlendMode: 'screen',
                    opacity: 0.95,
                    pointerEvents: 'none',
                    zIndex: 2,
                    animation: 'heroScan 4s ease-in-out infinite',
                    '@keyframes heroScan': {
                      '0%': { transform: 'translateY(-100%)' },
                      '50%': { transform: 'translateY(2250%)' },
                      '100%': { transform: 'translateY(-100%)' },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Quick Actions Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{
            mb: 6,
            fontWeight: 'bold',
            color: 'var(--fx-accent)',
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          <Card
            sx={{
              height: '100%',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 32px rgba(255, 152, 0, 0.18)',
              },
              cursor: 'pointer',
              backgroundColor: 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--fx-text-primary)',
              borderRadius: 3,
            }}
            onClick={handleReportMissing}
          >
            <CardContent sx={{ p: 4 }}>
              <IconButton
                sx={{
                  backgroundColor: 'rgba(255, 152, 0, 0.15)',
                  color: 'var(--fx-accent)',
                  mb: 2,
                  width: 64,
                  height: 64,
                }}
              >
                <AddIcon sx={{ fontSize: 32 }} />
              </IconButton>
              <Typography variant="h6" component="h3" gutterBottom>
                Report Missing Person
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                Submit detailed information about a missing person to help our
                community assist in the search.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              height: '100%',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 32px rgba(255, 152, 0, 0.18)',
              },
              cursor: 'pointer',
              backgroundColor: 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--fx-text-primary)',
              borderRadius: 3,
            }}
            onClick={handleSearchMissing}
          >
            <CardContent sx={{ p: 4 }}>
              <IconButton
                sx={{
                  backgroundColor: 'rgba(255, 152, 0, 0.15)',
                  color: 'var(--fx-accent)',
                  mb: 2,
                  width: 64,
                  height: 64,
                }}
              >
                <SearchIcon sx={{ fontSize: 32 }} />
              </IconButton>
              <Typography variant="h6" component="h3" gutterBottom>
                Search Database
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                Browse through our comprehensive database of missing persons
                using advanced search filters.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              height: '100%',
              textAlign: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 32px rgba(255, 152, 0, 0.18)',
              },
              cursor: 'pointer',
              backgroundColor: 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--fx-text-primary)',
              borderRadius: 3,
            }}
            onClick={() => navigate('/profile')}
          >
            <CardContent sx={{ p: 4 }}>
              <IconButton
                sx={{
                  backgroundColor: 'rgba(255, 152, 0, 0.15)',
                  color: 'var(--fx-accent)',
                  mb: 2,
                  width: 64,
                  height: 64,
                }}
              >
                <ManageAccountsIcon sx={{ fontSize: 32 }} />
              </IconButton>
              <Typography variant="h6" component="h3" gutterBottom>
                Manage Your Profile
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                Maintain contact details, alert preferences, and collaboration roles across every case.
              </Typography>
            </CardContent>
          </Card>

        </Box>
      </Container>

      {/* Contact Information */}
      <Box sx={{ 
        background: 'rgba(255, 152, 0, 0.0)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        py: 6 
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h5"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4, color: 'var(--fx-text-primary)' }}
          >
            Need Help? Contact Our Support Team
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ color: 'var(--fx-accent)' }} />
              <Typography variant="body1" sx={{ color: 'var(--fx-text-primary)' }}>
                Emergency: +91 | Support: 9896644615
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ color: 'var(--fx-accent)' }} />
              <Typography variant="body1" sx={{ color: 'var(--fx-text-primary)' }}>
                support@findxvision.com
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Hero;