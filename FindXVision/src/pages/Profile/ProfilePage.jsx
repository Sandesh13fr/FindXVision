import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AlternateEmail,
  AssignmentTurnedIn,
  Badge,
  History,
  Insights,
  LocationOn,
  LockOutlined,
  NotificationsActive,
  Phone,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../../components/Common/PrimaryButton';

const formatDate = (value) => {
  if (!value) return 'Not available';

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return 'Not available';
  }
};

const buildInitials = (user) => {
  if (!user) return 'FX';
  const parts = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase());

  if (parts.length === 0 && user.email) {
    return user.email.charAt(0).toUpperCase();
  }

  return parts.join('') || 'FX';
};

const getDisplayName = (user) => {
  if (!user) return 'FindXVision Member';
  const { firstName, lastName, email } = user;
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim();
  }
  return email || 'FindXVision Member';
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const initials = useMemo(() => buildInitials(user), [user]);
  const displayName = useMemo(() => getDisplayName(user), [user]);
  const roleLabel = user?.roleLabel || user?.roleKey || 'Responder';
  const joinedDate = formatDate(user?.createdAt);
  const lastUpdated = formatDate(user?.updatedAt);

  const contactDetails = useMemo(
    () => [
      {
        icon: <AlternateEmail fontSize="small" />,
        label: 'Email',
        value: user?.email || 'Not provided',
      },
      {
        icon: <Phone fontSize="small" />,
        label: 'Phone',
        value: user?.phoneNumber || user?.phone || 'Add a phone number',
      },
      {
        icon: <LocationOn fontSize="small" />,
        label: 'Location',
        value: user?.city || user?.region || 'Set your primary region',
      },
    ],
    [user],
  );

  const profileStats = useMemo(
    () => [
      {
        label: 'Cases reported',
        value: user?.stats?.casesReported ?? user?.casesReported ?? 0,
        icon: <AssignmentTurnedIn />,
      },
      {
        label: 'Notifications sent',
        value: user?.stats?.notificationsDispatched ?? user?.notificationsCount ?? 0,
        icon: <NotificationsActive />,
      },
      {
        label: 'Teams collaborating',
        value: user?.stats?.teams ?? user?.teams ?? 1,
        icon: <Insights />,
      },
    ],
    [user],
  );

  const completionScore = useMemo(() => {
    const checks = [
      Boolean(user?.email),
      Boolean(user?.phoneNumber || user?.phone),
      Boolean(user?.city || user?.region),
      Boolean(user?.lastLoginAt),
      Boolean(user?.stats?.casesReported ?? user?.casesReported),
    ];

    if (checks.length === 0) {
      return 0;
    }

    const filled = checks.filter(Boolean).length;
    return Math.min(100, Math.round((filled / checks.length) * 100));
  }, [user]);

  const completionLabel = useMemo(() => {
    if (completionScore >= 80) return 'Ready for action';
    if (completionScore >= 60) return 'Almost there';
    if (completionScore >= 40) return 'Keep building';
    return 'Add more details';
  }, [completionScore]);

  const profileHighlights = useMemo(
    () => [
      {
        title: 'Identity & reachability',
        description: user?.email
          ? `Primary email confirmed as ${user.email}`
          : 'Add a verified email so alerts reach you instantly.',
        icon: AlternateEmail,
      },
      {
        title: 'Real-time notifications',
        description: user?.phoneNumber || user?.phone
          ? 'SMS channel active—responders can mobilize you immediately.'
          : 'Add a mobile number to receive urgent SMS alerts for new leads.',
        icon: NotificationsActive,
      },
      {
        title: 'Case momentum',
        description:
          (user?.stats?.casesReported ?? user?.casesReported ?? 0) > 0
            ? 'You already have active cases—monitor and drive them to resolution.'
            : 'Launch your first case to start coordinating teams and volunteers.',
        icon: AssignmentTurnedIn,
      },
    ],
    [user],
  );

  const activityLog = useMemo(() => {
    const events = [];

    if (user?.lastLoginAt) {
      events.push({
        title: 'Last signed in',
        detail: formatDate(user.lastLoginAt),
      });
    }

    if (user?.lastActionDescription) {
      events.push({
        title: 'Recent activity',
        detail: user.lastActionDescription,
      });
    }

    if (events.length === 0) {
      events.push({
        title: 'No recent activity logged yet',
        detail: 'Your case updates and alerts will appear here once available.',
      });
    }

    return events;
  }, [user]);

  if (!user) {
    return (
      <Box sx={{ py: 16 }}>
        <Container maxWidth="sm">
          <Card className="fx-glass-card fx-glass-card--static" sx={{ textAlign: 'center', p: 6 }}>
            <Typography variant="h4" gutterBottom>
              Sign in to view your profile
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--fx-text-secondary)', mb: 4 }}>
              Your profile keeps case permissions, contact channels, and notifications in sync.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <PrimaryButton onClick={() => navigate('/login')}>
                Go to login
              </PrimaryButton>
              <PrimaryButton variant="outlined" onClick={() => navigate('/register')}>
                Create an account
              </PrimaryButton>
            </Stack>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 6, md: 8 }}>
          <Card
            className="fx-glass-panel fx-glass-panel--accent"
            sx={{
              overflow: 'hidden',
              position: 'relative',
              px: { xs: 4, md: 6 },
              py: { xs: 6, md: 8 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at top right, rgba(255, 152, 0, 0.25), transparent 45%)',
                opacity: 0.85,
                pointerEvents: 'none',
              }}
            />
            <Stack spacing={{ xs: 4, md: 5 }} sx={{ position: 'relative', zIndex: 1 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2.5}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
              >
                <Chip
                  label="Profile command center"
                  variant="outlined"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.28em',
                    borderColor: 'rgba(255, 152, 0, 0.35)',
                    color: 'var(--fx-accent)',
                    backgroundColor: 'rgba(255, 152, 0, 0.12)',
                    fontWeight: 600,
                  }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Tooltip title={`Role assigned on the platform: ${roleLabel}`} arrow>
                    <Chip
                      icon={<Badge fontSize="small" />}
                      label={roleLabel}
                      sx={{
                        borderRadius: 18,
                        backgroundColor: 'rgba(255, 152, 0, 0.14)',
                        color: 'var(--fx-accent)',
                        fontWeight: 600,
                      }}
                    />
                  </Tooltip>
                  <Tooltip
                    title={user?.lastLoginAt ? `Last signed in on ${formatDate(user.lastLoginAt)}` : 'No recent sign-in recorded'}
                    arrow
                  >
                    <Chip
                      icon={<History fontSize="small" />}
                      label={user?.lastLoginAt ? `Active ${formatDate(user.lastLoginAt)}` : 'Awaiting first sign-in'}
                      sx={{
                        borderRadius: 18,
                        backgroundColor: 'rgba(33, 33, 33, 0.6)',
                        color: 'var(--fx-text-secondary)',
                        letterSpacing: '0.08em',
                      }}
                    />
                  </Tooltip>
                </Stack>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 6 }} alignItems="center">
                <Avatar
                  sx={{
                    width: { xs: 96, md: 132 },
                    height: { xs: 96, md: 132 },
                    fontSize: { xs: '2.5rem', md: '3rem' },
                    fontWeight: 700,
                    backgroundColor: 'rgba(255, 152, 0, 0.18)',
                    color: 'var(--fx-accent)',
                    border: '2px solid rgba(255, 152, 0, 0.35)',
                    boxShadow: '0 12px 32px rgba(255, 152, 0, 0.25)',
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {displayName}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'var(--fx-text-secondary)', fontSize: '1.1rem', maxWidth: 640 }}
                    >
                      Keep your profile current so the right teams can reach you the moment a lead emerges.
                      Manage alerts, collaborate on cases, and control access from one secure command center.
                    </Typography>
                    <Stack spacing={1.5}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ flexWrap: 'wrap', gap: 1.5 }}
                      >
                        <Typography variant="subtitle2" sx={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                          Profile completeness
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                          {completionScore}% · {completionLabel}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={completionScore}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: 'linear-gradient(90deg, rgba(255,152,0,0.4), var(--fx-accent))',
                          },
                        }}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <PrimaryButton onClick={() => navigate('/report')}>
                        Open a new case
                      </PrimaryButton>
                      <PrimaryButton variant="outlined" onClick={() => navigate('/missing-persons')}>
                        View active cases
                      </PrimaryButton>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              <Divider className="fx-glass-divider" sx={{ my: { xs: 3.5, md: 4.5 } }} />

              <Grid container spacing={4}>
              {profileStats.map((stat) => (
                <Grid item xs={12} md={4} key={stat.label}>
                  <Card
                    className="fx-glass-card fx-glass-card--static"
                    sx={{
                      height: '100%',
                      background: 'rgba(26, 26, 26, 0.5)',
                      borderRadius: 18,
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 152, 0, 0.14)',
                            color: 'var(--fx-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {React.cloneElement(stat.icon, { sx: { fontSize: 28 } })}
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Card>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {profileHighlights.map((highlight) => {
            const HighlightIcon = highlight.icon;
            return (
              <Grid item xs={12} md={4} key={highlight.title}>
                <Card
                  className="fx-glass-card fx-glass-card--static"
                  sx={{
                    height: '100%',
                    padding: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 152, 0, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--fx-accent)',
                    }}
                  >
                    <HighlightIcon fontSize="medium" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {highlight.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)', lineHeight: 1.6 }}>
                    {highlight.description}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={{ xs: 4, md: 5 }}>
            <Grid item xs={12} md={7}>
              <Card className="fx-glass-card fx-glass-card--static" sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    Contact & identity
                  </Typography>
                  <Grid container spacing={2.5}>
                    {contactDetails.map((detail) => (
                      <Grid item xs={12} sm={6} key={detail.label}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            borderRadius: 2,
                            padding: 2.5,
                            height: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 152, 0, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--fx-accent)',
                              flexShrink: 0,
                            }}
                          >
                            {detail.icon}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                              {detail.label}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'var(--fx-text-secondary)' }}>
                              {detail.value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider className="fx-glass-divider" sx={{ my: 4 }} />

                  <Box
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(255,152,0,0.14), rgba(20,20,20,0.6))',
                      border: '1px solid rgba(255, 152, 0, 0.28)',
                      p: 3,
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Typography variant="caption" sx={{ letterSpacing: 2, color: 'rgba(0,0,0,0.65)' }}>
                        Membership timeline
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#121212', fontWeight: 600 }}>
                        Joined FindXVision on {joinedDate}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.7)' }}>
                        Profile last updated {lastUpdated}
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={4}>
                <Card className="fx-glass-card fx-glass-card--static">
                  <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Security & access
                    </Typography>
                    <Stack spacing={2.5}>
                      <Stack direction="row" spacing={2}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255, 152, 0, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--fx-accent)',
                          }}
                        >
                          <LockOutlined />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Password & MFA
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                            Protect access with a strong password and enable multi-factor authentication.
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255, 152, 0, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--fx-accent)',
                          }}
                        >
                          <NotificationsActive />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Notification channels
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                            Keep SMS and email details current so teams can mobilise you instantly.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Card className="fx-glass-card fx-glass-card--static">
                  <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Recent activity
                    </Typography>
                    <List dense disablePadding>
                      {activityLog.map((item, index) => (
                        <React.Fragment key={`${item.title}-${index}`}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ color: 'var(--fx-accent)', minWidth: 36 }}>
                              <History fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.title}
                              secondary={item.detail}
                              primaryTypographyProps={{ sx: { fontWeight: 600 } }}
                              secondaryTypographyProps={{ sx: { color: 'var(--fx-text-secondary)' } }}
                            />
                          </ListItem>
                          {index < activityLog.length - 1 && (
                            <Divider className="fx-glass-divider" sx={{ my: 1.5 }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default ProfilePage;
