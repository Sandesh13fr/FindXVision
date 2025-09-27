import React, { useCallback, useEffect, useMemo, useState } from 'react';
import  { Alert, Box, Card, CardContent, CardMedia, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography, InputAdornment, Tooltip }  from '@mui/material';
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

  const fetchMissingPersons = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const response = await casesAPI.getCases({
        approvalStatus: 'approved',
        status: 'active',
        limit: 50,
      });
      const data = response?.data?.data ?? [];
      setPersons(data);
    } catch (error) {
      console.error('Error fetching missing persons:', error);
      setAlert({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to fetch missing persons',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      setPersons((prev) => prev.filter((p) => p.adhaarNumber !== adhaarNumber));
      setAlert({ type: 'success', message: 'Person deleted successfully' });
    } catch (error) {
      console.error('Error deleting person:', error);
      setAlert({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to delete person',
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
    const baseLocation = person.lastSeenLocation?.latitude && person.lastSeenLocation?.longitude
      ? {
          lat: person.lastSeenLocation.latitude,
          lng: person.lastSeenLocation.longitude,
          address: person.lastSeenLocation.address,
        }
      : person.lastSeenLocation?.lat && person.lastSeenLocation?.lng
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

    setSubmittingSighting(true);

    try {
      const payload = {
        location: {
          latitude: sightingLocation.lat,
          longitude: sightingLocation.lng,
          address: sightingLocation.address,
        },
        notes: sightingNotes.trim() ? sightingNotes.trim() : undefined,
        observedAt: new Date().toISOString(),
      };

      const response = await casesAPI.addSighting(selectedPerson._id, payload);
      const updatedPerson = response?.data?.data?.person;

      if (updatedPerson) {
        setPersons((prev) =>
          prev.map((p) =>
            (p._id && updatedPerson._id && p._id === updatedPerson._id) ||
            (p.adhaarNumber && updatedPerson.adhaarNumber && p.adhaarNumber === updatedPerson.adhaarNumber)
              ? updatedPerson
              : p
          )
        );
      } else {
        await fetchMissingPersons(false);
      }

      setAlert({ type: 'success', message: 'Sighting submitted successfully.' });
      closeSightingDialog();
    } catch (error) {
      console.error('Error submitting sighting:', error);
      setFormError(error?.response?.data?.message || 'Failed to submit sighting');
    } finally {
      setSubmittingSighting(false);
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    if (!buffer) return null;
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return window.btoa(binary);
  };

  const getImageSrc = (person) => {
    if (person.image?.data?.data) {
      const base64 = arrayBufferToBase64(person.image.data.data);
      return `data:${person.image.contentType};base64,${base64}`;
    }
    return null;
  };

  const filteredPersons = persons.filter((person) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const nameMatch = person.name?.toLowerCase().includes(term);
    const adhaarMatch = person.adhaarNumber?.includes(term);
    const addressMatch = person.address?.toLowerCase().includes(term);
    return nameMatch || adhaarMatch || addressMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'warning';
      case 'found':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Missing Persons</Typography>
        <PrimaryButton
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refreshList}
          disabled={refreshing}
        >
          Refresh
        </PrimaryButton>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

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
        sx={{ mb: 3 }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {filteredPersons.map((person) => {
          const sightingsCount = person.sightings?.length || 0;
          const sightingsSorted = sightingsCount
            ? [...person.sightings].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
            : [];
          const latestSighting = sightingsSorted[0];

          return (
            <Card key={person._id || person.adhaarNumber}>
            <CardMedia
              component="div"
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
              }}
            >
              {getImageSrc(person) ? (
                <img
                  src={getImageSrc(person)}
                  alt={person.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <PersonIcon sx={{ fontSize: 80, color: 'grey.400' }} />
              )}
            </CardMedia>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {person.name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {person.age ? `Age: ${person.age}` : 'Age unknown'} | {person.gender || 'Unspecified'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Adhaar: {person.adhaarNumber}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Address: {person.address}
              </Typography>
              {person.lastSeenLocation?.address && (
                <Typography variant="body2" gutterBottom>
                  Last Seen Location: {person.lastSeenLocation.address}
                </Typography>
              )}
              {person.lastSeenAt && (
                <Typography variant="body2" gutterBottom>
                  Last Seen: {new Date(person.lastSeenAt).toLocaleString()}
                </Typography>
              )}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 2 }}
                spacing={1}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={person.status || 'active'}
                    color={getStatusColor(person.status)}
                    size="small"
                  />
                  <Chip
                    variant="outlined"
                    size="small"
                    icon={<Visibility fontSize="small" />}
                    label={`${sightingsCount} sighting${sightingsCount === 1 ? '' : 's'}`}
                  />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {isAuthenticated ? (
                    <PrimaryButton
                      size="small"
                      variant="contained"
                      onClick={() => openSightingDialog(person)}
                    >
                      Report Sighting
                    </PrimaryButton>
                  ) : (
                    <Tooltip title="Sign in to report a sighting">
                      <span>
                        <PrimaryButton size="small" variant="contained" disabled>
                          Report Sighting
                        </PrimaryButton>
                      </span>
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
              </Stack>

              {latestSighting && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Recent sighting
                  </Typography>
                  <Stack spacing={0.5} sx={{ mb: sightingsCount > 1 ? 1 : 0 }}>
                    <Typography variant="body2">
                      {new Date(latestSighting.createdAt).toLocaleString()}
                    </Typography>
                    {latestSighting.location?.address && (
                      <Typography variant="body2" color="text.secondary">
                        {latestSighting.location.address}
                      </Typography>
                    )}
                    {latestSighting.notes && (
                      <Typography variant="body2" color="text.secondary">
                        Notes: {latestSighting.notes}
                      </Typography>
                    )}
                    {latestSighting.reportedBy && (
                      <Typography variant="caption" color="text.secondary">
                        Reported by {latestSighting.reportedBy.firstName || 'User'}{' '}
                        {latestSighting.reportedBy.lastName || ''}
                      </Typography>
                    )}
                  </Stack>
                  {sightingsCount > 1 && (
                    <Typography variant="caption" color="text.secondary">
                      +{sightingsCount - 1} more sighting{(sightingsCount - 1) === 1 ? '' : 's'} reported.
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          );
        })}
      </Box>

      {filteredPersons.length === 0 && (
        <Box textAlign="center" py={4}>
          <PersonIcon sx={{ fontSize: 64, color: 'grey.400' }} />
          <Typography variant="h6" color="text.secondary">
            No missing persons found
          </Typography>
        </Box>
      )}

      <Dialog open={sightingDialogOpen} onClose={closeSightingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Report a sighting
          {selectedPerson ? ` — ${selectedPerson.name}` : ''}
        </DialogTitle>
        <DialogContent dividers>
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
    </Box>
  );
};

export default MissingPersonsList;