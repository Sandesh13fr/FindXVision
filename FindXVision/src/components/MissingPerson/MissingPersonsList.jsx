import React, { useCallback, useEffect, useMemo, useState } from 'react';
import  { Alert, Box, Card, CardActions, CardContent, CardMedia, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, TextField, Typography, InputAdornment, Tooltip }  from '@mui/material';
import {
  Delete,
  Person as PersonIcon,
  Refresh,
  Search,
  Visibility,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { casesAPI } from '../../services/api';
import LocationPicker from '../Maps/LocationPicker';

import PrimaryButton from '../Common/PrimaryButton';
const MissingPersonsList = () => {
  const [persons, setPersons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [sightingDialogOpen, setSightingDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sightingNotes, setSightingNotes] = useState('');
  const [sightingLocation, setSightingLocation] = useState(null);
  const [submittingSighting, setSubmittingSighting] = useState(false);
  const [formError, setFormError] = useState(null);

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isAdmin = useMemo(() => user?.roleKey === 'ADMIN', [user]);

  const arrayBufferToBase64 = useCallback((buffer) => {
    if (!buffer) return null;
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(binary);
    }
    return null;
  }, []);

  const getImageSrc = useCallback(
    (person) => {
      const data = person?.image?.data?.data;
      if (!data) return null;
      const contentType = person?.image?.contentType || 'image/jpeg';
      const base64 = arrayBufferToBase64(data);
      return base64 ? `data:${contentType};base64,${base64}` : null;
    },
    [arrayBufferToBase64],
  );

  const fetchMissingPersons = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) {
          setLoading(true);
        }
        const response = await casesAPI.getCases({
          approvalStatus: 'approved',
          limit: 50,
        });
        const data = response?.data?.data ?? [];
        setPersons(data);
      } catch (error) {
        console.error('Error fetching missing persons:', error);
        setAlert({
          type: 'error',
          message: error?.response?.data?.message || 'Failed to fetch missing persons.',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchMissingPersons();
  }, [fetchMissingPersons]);

  const deletePerson = async (adhaarNumber) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this report permanently?')) {
      return;
    }

    try {
      await casesAPI.deleteCase(adhaarNumber);
      setPersons((prev) => prev.filter((person) => person.adhaarNumber !== adhaarNumber));
      setAlert({ type: 'success', message: 'Person deleted successfully.' });
    } catch (error) {
      console.error('Error deleting person:', error);
      setAlert({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to delete person.',
      });
    }
  };

  const refreshList = async () => {
    setRefreshing(true);
    await fetchMissingPersons(false);
  };

  const openSightingDialog = (person) => {
    setSelectedPerson(person);
    setSightingDialogOpen(true);
    setSightingNotes('');
    const baseLocation =
      person?.lastSeenLocation?.latitude && person?.lastSeenLocation?.longitude
        ? {
            lat: person.lastSeenLocation.latitude,
            lng: person.lastSeenLocation.longitude,
            address: person.lastSeenLocation.address,
          }
        : person?.lastSeenLocation?.lat && person?.lastSeenLocation?.lng
          ? {
              lat: person.lastSeenLocation.lat,
              lng: person.lastSeenLocation.lng,
              address: person.lastSeenLocation.address,
            }
          : null;

    setSightingLocation(baseLocation);
    setFormError(null);
  };

  const closeSightingDialog = () => {
    setSightingDialogOpen(false);
    setSelectedPerson(null);
    setSightingNotes('');
    setSightingLocation(null);
    setFormError(null);
  };

  const handleSightingSubmit = async () => {
    if (!selectedPerson) {
      return;
    }

    if (!sightingLocation?.lat || !sightingLocation?.lng) {
      setFormError('Please select where the person was sighted.');
      return;
    }

    try {
      setSubmittingSighting(true);
      const payload = {
        location: {
          latitude: sightingLocation.lat,
          longitude: sightingLocation.lng,
          address: sightingLocation.address,
        },
        notes: sightingNotes?.trim() || undefined,
      };

      const response = await casesAPI.addSighting(
        selectedPerson._id ?? selectedPerson.id,
        payload,
      );
      const updatedPerson = response?.data?.data?.person;

      if (updatedPerson?._id) {
        setPersons((prev) =>
          prev.map((person) => (person._id === updatedPerson._id ? updatedPerson : person)),
        );
      } else {
        fetchMissingPersons(false);
      }

      setAlert({
        type: 'success',
        message: 'Sighting submitted successfully.',
      });
      closeSightingDialog();
    } catch (error) {
      console.error('Error submitting sighting:', error);
      setFormError(
        error?.response?.data?.message || 'Failed to submit sighting. Please try again.',
      );
    } finally {
      setSubmittingSighting(false);
    }
  };

  const stats = useMemo(() => {
    if (!persons.length) {
      return {
        total: 0,
        active: 0,
        found: 0,
        withSightings: 0,
        latestTimestamp: null,
      };
    }

    return persons.reduce(
      (acc, person) => {
        const status = (person.status || '').toLowerCase();
        if (status === 'active') acc.active += 1;
        if (status === 'found') acc.found += 1;
        if (person.sightings?.length) acc.withSightings += 1;

        const timestamps = [
          person.updatedAt,
          person.lastSeenAt,
          person.createdAt,
          person.approvedAt,
        ]
          .map((value) => (value ? new Date(value).getTime() : null))
          .filter(Boolean);

        if (timestamps.length) {
          acc.latestTimestamp = Math.max(acc.latestTimestamp ?? 0, ...timestamps);
        }

        return acc;
      },
      {
        total: persons.length,
        active: 0,
        found: 0,
        withSightings: 0,
        latestTimestamp: null,
      },
    );
  }, [persons]);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All statuses' },
      { value: 'active', label: 'Active' },
      { value: 'found', label: 'Found' },
      { value: 'closed', label: 'Closed' },
    ],
    [],
  );

  const filteredPersons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return persons.filter((person) => {
      const normalizedStatus = (person.status || '').toLowerCase();
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const fields = [
        person.name,
        person.adhaarNumber ? String(person.adhaarNumber) : '',
        person.address,
      ];

      return fields.some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(term),
      );
    });
  }, [persons, searchTerm, statusFilter]);

  const lastUpdateLabel = stats.latestTimestamp
    ? new Date(stats.latestTimestamp).toLocaleString()
    : '—';

  const activeStatusLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label || 'All statuses';

  const filtersApplied = statusFilter !== 'all' || Boolean(searchTerm.trim());

  const summaryTiles = useMemo(
    () => [
      { label: 'Reports live', value: stats.total.toString() },
      { label: 'Active cases', value: stats.active.toString() },
      { label: 'Marked found', value: stats.found.toString() },
      { label: 'Sightings logged', value: stats.withSightings.toString() },
    ],
    [stats],
  );

  const getStatusColor = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active') return 'warning';
    if (normalized === 'found') return 'success';
    if (normalized === 'closed') return 'default';
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4} sx={{ color: 'var(--fx-text-primary)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        {alert && (
          <Alert
            severity={alert.type}
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(255, 152, 0, 0.35)',
              backgroundColor: 'rgba(255, 152, 0, 0.12)',
              color: 'var(--fx-text-primary)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        <Box
          className="fx-glass-panel"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            color: 'var(--fx-text-primary)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background:
              'linear-gradient(130deg, rgba(25, 28, 36, 0.78) 0%, rgba(30, 34, 44, 0.86) 55%, rgba(42, 49, 62, 0.9) 100%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'var(--fx-accent)',
              opacity: 0.18,
              filter: 'blur(48px)',
              top: -160,
              right: -120,
            }}
          />

          <Stack spacing={{ xs: 3, md: 4 }} position="relative">
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  label={activeStatusLabel}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.22)',
                    color: 'var(--fx-text-secondary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  }}
                />
                <Chip
                  label={filtersApplied ? 'Filtered view' : 'Showing everything'}
                  sx={{
                    color: filtersApplied ? 'var(--fx-accent)' : 'var(--fx-text-secondary)',
                    backgroundColor: filtersApplied
                      ? 'rgba(255, 152, 0, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'transparent',
                  }}
                />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Missing persons command center
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--fx-text-secondary)' }}>
                Keep track of every active report, review the latest sightings, and signal the network the moment a case changes status.
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {summaryTiles.map((tile) => (
                <Grid item xs={6} sm={3} key={tile.label}>
                  <Card
                    className="fx-glass-card fx-glass-card--static"
                    sx={{
                      borderRadius: 3,
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      boxShadow: '0 20px 45px -25px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    <CardContent sx={{ py: 2.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--fx-text-secondary)' }}
                        gutterBottom
                      >
                        {tile.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {tile.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', lg: 'center' }}
            >
              <TextField
                fullWidth
                placeholder="Search by name, Adhaar number, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.18)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--fx-accent)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--fx-accent)',
                    },
                    '& input': {
                      color: 'var(--fx-text-primary)',
                    },
                  },
                }}
              />

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
              >
                {statusOptions.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    onClick={() => setStatusFilter(option.value)}
                    color={statusFilter === option.value ? 'warning' : 'default'}
                    variant={statusFilter === option.value ? 'filled' : 'outlined'}
                    sx={{
                      px: 1.5,
                      borderRadius: 2,
                      borderColor: 'rgba(255, 255, 255, 0.22)',
                      color:
                        statusFilter === option.value
                          ? 'var(--fx-text-primary)'
                          : 'var(--fx-text-secondary)',
                      backgroundColor:
                        statusFilter === option.value
                          ? 'rgba(255, 152, 0, 0.25)'
                          : 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                ))}
              </Stack>

              <PrimaryButton
                variant="outlined"
                startIcon={<Refresh />}
                onClick={refreshList}
                disabled={refreshing}
                sx={{ alignSelf: { xs: 'stretch', lg: 'center' } }}
              >
                Refresh
              </PrimaryButton>
            </Stack>

            <Typography variant="caption" sx={{ color: 'var(--fx-text-secondary)' }}>
              {`Last refreshed ${lastUpdateLabel}`}
            </Typography>
          </Stack>
        </Box>

        <Box
          className="fx-glass-panel"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(18, 19, 24, 0.72)',
            color: 'var(--fx-text-primary)',
          }}
        >
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {filteredPersons.map((person) => {
              const sightingsCount = person.sightings?.length || 0;
              const sightingsSorted = sightingsCount
                ? [...person.sightings].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                : [];
              const latestSighting = sightingsSorted[0];

              return (
                <Grid item xs={12} sm={6} lg={4} xl={3} key={person._id || person.adhaarNumber}>
                  <Card
                    className="fx-glass-card fx-glass-card--static"
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      color: 'var(--fx-text-primary)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: 'rgba(32, 34, 43, 0.8)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 210,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                      }}
                    >
                      {getImageSrc(person) ? (
                        <img
                          src={getImageSrc(person)}
                          alt={person.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <PersonIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.35)' }} />
                      )}
                    </CardMedia>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="h6">
                        {person.name}
                      </Typography>
                      <Typography sx={{ color: 'var(--fx-text-secondary)' }}>
                        {person.age ? `Age: ${person.age}` : 'Age unknown'} | {person.gender || 'Unspecified'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                        Adhaar: {person.adhaarNumber || '—'}
                      </Typography>
                      <Typography variant="body2">
                        Address: {person.address || 'Not provided'}
                      </Typography>
                      {person.lastSeenLocation?.address && (
                        <Typography variant="body2">
                          Last Seen Location: {person.lastSeenLocation.address}
                        </Typography>
                      )}
                      {person.lastSeenAt && (
                        <Typography variant="body2">
                          Last Seen: {new Date(person.lastSeenAt).toLocaleString()}
                        </Typography>
                      )}

                      {latestSighting && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em' }} gutterBottom>
                            Recent sighting
                          </Typography>
                          <Stack spacing={0.5} sx={{ color: 'var(--fx-text-secondary)' }}>
                            <Typography variant="body2">
                              {new Date(latestSighting.createdAt).toLocaleString()}
                            </Typography>
                            {latestSighting.location?.address && (
                              <Typography variant="body2">
                                {latestSighting.location.address}
                              </Typography>
                            )}
                            {latestSighting.notes && (
                              <Typography variant="body2">
                                Notes: {latestSighting.notes}
                              </Typography>
                            )}
                            {latestSighting.reportedBy && (
                              <Typography variant="caption">
                                Reported by {latestSighting.reportedBy.firstName || 'User'} {latestSighting.reportedBy.lastName || ''}
                              </Typography>
                            )}
                          </Stack>
                          {sightingsCount > 1 && (
                            <Typography variant="caption" sx={{ mt: 1, color: 'var(--fx-text-secondary)' }}>
                              +{sightingsCount - 1} more sighting{(sightingsCount - 1) === 1 ? '' : 's'} reported.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions
                      sx={{
                        px: 3,
                        pb: 3,
                        pt: latestSighting ? 0 : 2,
                        mt: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        alignItems: 'stretch',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Chip
                          label={(person.status || 'active').toUpperCase()}
                          color={getStatusColor(person.status)}
                          size="small"
                        />
                        <Chip
                          variant="outlined"
                          size="small"
                          icon={<Visibility fontSize="small" />}
                          label={`${sightingsCount} sighting${sightingsCount === 1 ? '' : 's'}`}
                          sx={{ color: 'var(--fx-text-secondary)' }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        {isAuthenticated ? (
                          <PrimaryButton
                            size="small"
                            variant="contained"
                            onClick={() => openSightingDialog(person)}
                            sx={{ flexGrow: 1 }}
                          >
                            Report Sighting
                          </PrimaryButton>
                        ) : (
                          <Tooltip title="Sign in to report a sighting">
                            <Box sx={{ flexGrow: 1 }}>
                              <PrimaryButton size="small" variant="contained" disabled fullWidth>
                                Report Sighting
                              </PrimaryButton>
                            </Box>
                          </Tooltip>
                        )}
                        {isAdmin && isAuthenticated && (
                          <PrimaryButton
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => deletePerson(person.adhaarNumber)}
                          >
                            Delete
                          </PrimaryButton>
                        )}
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {filteredPersons.length === 0 && (
            <Box textAlign="center" py={6}>
              <PersonIcon sx={{ fontSize: 72, color: 'rgba(255, 255, 255, 0.24)' }} />
              <Typography variant="h6" sx={{ mt: 2, color: 'var(--fx-text-secondary)' }}>
                No matching reports
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                Try adjusting your filters or clearing the search to view all active cases.
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>

      <Dialog
        open={sightingDialogOpen}
        onClose={closeSightingDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'fx-glass-panel',
          sx: { backgroundColor: 'rgba(18, 18, 18, 0.85)', borderRadius: 3 },
        }}
        BackdropProps={{
          sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0, 0, 0, 0.45)' },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            pb: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--fx-accent)',
          }}
        >
          Report a sighting
          {selectedPerson ? ` — ${selectedPerson.name}` : ''}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            background: 'rgba(20, 20, 20, 0.55)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <Stack spacing={2}>
            {formError && (
              <Alert severity="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              Share where this person was seen. Your report alerts administrators and updates the last seen location for everyone.
            </Typography>
            <LocationPicker
              key={selectedPerson?._id || 'new-sighting'}
              initialLocation={sightingLocation ?? undefined}
              onLocationSelect={(location) => {
                setSightingLocation(location);
                setFormError(null);
              }}
              buttonText="Choose sighting location"
            />
            <TextField
              label="Notes (optional)"
              placeholder="Add details about the sighting"
              multiline
              minRows={3}
              value={sightingNotes}
              onChange={(e) => setSightingNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <PrimaryButton onClick={closeSightingDialog} disabled={submittingSighting}>
            Cancel
          </PrimaryButton>
          <PrimaryButton
            onClick={handleSightingSubmit}
            variant="contained"
            disabled={submittingSighting}
          >
            {submittingSighting ? 'Submitting...' : 'Submit Sighting'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MissingPersonsList;