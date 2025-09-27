import React, { useCallback, useEffect, useMemo, useState } from 'react';
import  { Alert, Box, Card, CardActions, CardContent, CardMedia, Chip, CircularProgress, Container, Divider, Stack, Tab, Tabs, Typography }  from '@mui/material';
import {
  CheckCircleOutline,
  DoneAll,
  Person as PersonIcon,
  Place,
  Refresh,
  Schedule,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

import PrimaryButton from '../../components/Common/PrimaryButton';
const TABS = [
  { label: 'Pending Approval', value: 'pending' },
  { label: 'Approved Reports', value: 'approved' },
];

const MAX_PAGE_SIZE = 50;

const MissingPersonsAdmin = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await adminAPI.getMissingPersons({
        approvalStatus: activeTab,
        limit: MAX_PAGE_SIZE,
        page: 1,
        status: 'active',
      });

      const data = response?.data?.data ?? [];
      setReports(data);
    } catch (error) {
      console.error('Failed to load missing person reports:', error);
      const message =
        error?.response?.data?.message || 'Unable to load missing person reports right now.';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleApprove = async (reportId) => {
    try {
      await adminAPI.approveMissingPerson(reportId);
      setAlert({ type: 'success', message: 'Report approved and published successfully.' });
      fetchReports();
    } catch (error) {
      console.error('Failed to approve missing person report:', error);
      const message =
        error?.response?.data?.message || 'Unable to approve this report. Please try again.';
      setAlert({ type: 'error', message });
    }
  };

  const handleMarkFound = async (reportId, personName) => {
    const confirm = window.confirm(
      `Mark ${personName || 'this person'} as found? This will permanently remove their record.`,
    );

    if (!confirm) {
      return;
    }

    try {
      await adminAPI.markMissingPersonFound(reportId);
      setAlert({ type: 'success', message: 'Person marked as found and data removed.' });
      fetchReports();
    } catch (error) {
      console.error('Failed to mark person as found:', error);
      const message =
        error?.response?.data?.message || 'Unable to mark as found. Please try again.';
      setAlert({ type: 'error', message });
    }
  };

  const arrayBufferToBase64 = useCallback((buffer) => {
    if (!buffer) return null;
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return window.btoa(binary);
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

  const activeTabLabel = useMemo(
    () => TABS.find((tab) => tab.value === activeTab)?.label || 'Reports',
    [activeTab],
  );

  const emptyStateCopy =
    activeTab === 'pending'
      ? 'No pending reports awaiting approval right now.'
      : 'No approved reports to display.';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Missing Person Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and govern the lifecycle of missing person submissions.
          </Typography>
        </Box>
        <PrimaryButton
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchReports}
          disabled={loading}
        >
          Refresh
        </PrimaryButton>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 2 }}
        indicatorColor="primary"
        textColor="primary"
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {alert && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert(null)}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={320}
          textAlign="center"
          sx={{ color: 'text.secondary' }}
        >
          <PersonIcon sx={{ fontSize: 72, mb: 2 }} />
          <Typography variant="h6">{emptyStateCopy}</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {reports.map((person) => (
            <Card key={person._id} variant="outlined">
              <Stack direction={{ xs: 'column', sm: 'row' }}>
                <CardMedia
                  component="div"
                  sx={{
                    minWidth: { xs: '100%', sm: 260 },
                    maxWidth: { xs: '100%', sm: 260 },
                    height: 220,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getImageSrc(person) ? (
                    <img
                      src={getImageSrc(person)}
                      alt={person.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <PersonIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                  )}
                </CardMedia>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="h5">{person.name}</Typography>
                    <Chip
                      color={activeTab === 'pending' ? 'warning' : 'success'}
                      label={person.approvalStatus?.toUpperCase() || 'UNKNOWN'}
                      size="small"
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Reported on {new Date(person.createdAt).toLocaleString()}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Place fontSize="small" color="action" />
                      <Typography variant="body2">
                        Last seen at {person.lastSeenLocation?.address || person.address}
                      </Typography>
                    </Stack>
                    {person.lastSeenAt && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2">
                          Last seen on {new Date(person.lastSeenAt).toLocaleString()}
                        </Typography>
                      </Stack>
                    )}
                    {person.lastSeenNotes && (
                      <Typography variant="body2" color="text.secondary">
                        Notes: {person.lastSeenNotes}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Adhaar: {person.adhaarNumber}
                    </Typography>
                  </Stack>
                </CardContent>
              </Stack>

              <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                <Stack direction="row" spacing={1}>
                  <Chip
                    variant="outlined"
                    size="small"
                    icon={<PersonIcon fontSize="small" />}
                    label={`Reported by ${person.reportedBy?.firstName || 'Unknown'}`}
                  />
                  <Chip
                    variant="outlined"
                    size="small"
                    icon={<CheckCircleOutline fontSize="small" />}
                    label={`Status: ${person.status || 'active'}`}
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  {activeTab === 'pending' && (
                    <PrimaryButton
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleOutline />}
                      onClick={() => handleApprove(person._id)}
                    >
                      Approve
                    </PrimaryButton>
                  )}
                  <PrimaryButton
                    variant="outlined"
                    color="success"
                    startIcon={<DoneAll />}
                    onClick={() => handleMarkFound(person._id, person.name)}
                  >
                    Mark Found
                  </PrimaryButton>
                </Stack>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="caption" color="text.secondary">
          Viewing {reports.length} {activeTabLabel.toLowerCase()}.
        </Typography>
      </Box>
    </Container>
  );
};

export default MissingPersonsAdmin;
