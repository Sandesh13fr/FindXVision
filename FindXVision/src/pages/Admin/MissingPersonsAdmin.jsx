 import React, { useCallback, useEffect, useMemo, useState } from 'react';
import  { Alert, Box, Card, CardActions, CardContent, CardMedia, Chip, CircularProgress, Container, Divider, InputAdornment, Stack, Tab, Tabs, TextField, Tooltip, Typography }  from '@mui/material';
import {
  CheckCircleOutline,
  DoneAll,
  Person as PersonIcon,
  Place,
  Refresh,
  Schedule,
  Search,
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
  const [searchTerm, setSearchTerm] = useState('');

  const heroStyles = {
    background: 'rgba(20, 20, 20, 0.55)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    borderRadius: 3,
    boxShadow: '0 36px 90px rgba(0, 0, 0, 0.42)',
    px: { xs: 3.5, md: 6 },
    py: { xs: 4, md: 5 },
  };

  const surfaceStyles = {
    background: 'rgba(18, 18, 18, 0.6)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: 3,
    boxShadow: '0 32px 88px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
  };

  const tabStyles = {
    '& .MuiTab-root': {
      color: 'var(--fx-text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      minHeight: 52,
      fontWeight: 600,
      minWidth: 0,
    },
    '& .MuiTabs-flexContainer': {
      gap: { xs: 0.5, md: 1 },
    },
    '& .Mui-selected': {
      color: 'var(--fx-accent) !important',
    },
  };

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

  const emptyStateCopy = useMemo(() => {
    if (searchTerm.trim()) {
      return 'No reports match your search or filters.';
    }

    return activeTab === 'pending'
      ? 'No pending reports awaiting approval right now.'
      : 'No approved reports to display.';
  }, [activeTab, searchTerm]);

  const visibleReports = useMemo(() => {
    if (!searchTerm.trim()) {
      return reports;
    }

    const normalized = searchTerm.trim().toLowerCase();
    return reports.filter((report) => {
      const fields = [
        report?.name,
        report?.adhaarNumber,
        report?.lastSeenLocation?.address,
        report?.address,
      ];

      return fields.some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(normalized),
      );
    });
  }, [reports, searchTerm]);

  const stats = useMemo(() => {
    const withPhotos = visibleReports.filter((report) => Boolean(report?.image?.data?.data?.length)).length;
    const sourceForLatest = visibleReports.length ? visibleReports : reports;
    const latestTimestamp = sourceForLatest.reduce((latest, report) => {
      const timestamp = report?.updatedAt || report?.createdAt;
      if (!timestamp) return latest;
      if (!latest) return timestamp;
      return new Date(timestamp) > new Date(latest) ? timestamp : latest;
    }, null);

    return {
      total: reports.length,
      visible: visibleReports.length,
      withPhotos,
      latest: latestTimestamp,
    };
  }, [reports, visibleReports]);

  const summaryMetrics = useMemo(
    () => [
      { label: 'Entries showing', value: `${stats.visible} / ${stats.total}` },
      { label: 'Reports with photo evidence', value: stats.withPhotos.toString() },
      {
        label: 'Last update processed',
        value: stats.latest ? new Date(stats.latest).toLocaleString() : '—',
      },
    ],
    [stats],
  );

  const lastUpdatedLabel = stats.latest ? new Date(stats.latest).toLocaleString() : '—';

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 }, px: { xs: 2.5, md: 4 } }}>
      <Stack spacing={4}>
        <Box className="fx-glass-panel" sx={heroStyles}>
          <Box>
            <Chip
              label="Admin command center"
              color="warning"
              variant="outlined"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.28em',
                borderColor: 'rgba(255, 152, 0, 0.35)',
                color: 'var(--fx-accent)',
                backgroundColor: 'rgba(255, 152, 0, 0.12)',
                fontWeight: 600,
                mb: 2,
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Missing Person Reports
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--fx-text-secondary)', maxWidth: 620 }}>
              Govern submissions, fast-track approvals, and coordinate takedowns with a single operational picture.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2.5}
            sx={{ mt: 4.5, flexWrap: 'wrap', rowGap: 2.5 }}
          >
            {summaryMetrics.map((metric) => (
              <Box
                key={metric.label}
                className="fx-glass-card"
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', md: 220 },
                  p: 3,
                  borderRadius: 3,
                }}
              >
                <Typography variant="overline" sx={{ color: 'var(--fx-accent)', letterSpacing: '0.22em' }}>
                  {metric.label}
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                  {metric.value}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Box
            sx={{
              mt: { xs: 4, md: 5 },
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: 'rgba(12, 12, 12, 0.55)',
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 2.5, md: 3 },
            }}
          >
            <Stack spacing={{ xs: 3, md: 3.5 }}>
              <Stack
                direction={{ xs: 'column', xl: 'row' }}
                spacing={{ xs: 2.5, md: 3 }}
                alignItems={{ xl: 'center' }}
                justifyContent="space-between"
              >
                <Tabs
                  value={activeTab}
                  onChange={(_, value) => setActiveTab(value)}
                  TabIndicatorProps={{ style: { backgroundColor: 'var(--fx-accent)', height: 3, borderRadius: 12 } }}
                  sx={{ ...tabStyles, flexShrink: 0 }}
                  variant="scrollable"
                  allowScrollButtonsMobile
                >
                  {TABS.map((tab) => (
                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                  ))}
                </Tabs>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', xl: 'auto' } }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by name, ID or location"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: 20, color: 'var(--fx-text-secondary)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: { xs: '100%', sm: 280 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--fx-text-primary)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                      },
                      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 152, 0, 0.6)',
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--fx-accent)',
                      },
                    }}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <PrimaryButton
                      variant="contained"
                      startIcon={<Refresh />}
                      onClick={fetchReports}
                      loading={loading}
                    >
                      Refresh data
                    </PrimaryButton>
                    <PrimaryButton
                      variant="outlined"
                      onClick={() => setSearchTerm('')}
                      disabled={!searchTerm.trim()}
                    >
                      Clear search
                    </PrimaryButton>
                  </Stack>
                </Stack>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
                <Tooltip title="Entries currently visible after filters" placement="top" arrow>
                  <Chip
                    icon={<CheckCircleOutline fontSize="small" />}
                    label={`${stats.visible} showing`}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 152, 0, 0.12)',
                      border: '1px solid rgba(255, 152, 0, 0.3)',
                      color: 'var(--fx-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                    }}
                  />
                </Tooltip>
                <Tooltip title="Reports that include photo evidence" placement="top" arrow>
                  <Chip
                    icon={<DoneAll fontSize="small" />}
                    label={`${stats.withPhotos} with photos`}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--fx-text-secondary)',
                      letterSpacing: '0.12em',
                    }}
                  />
                </Tooltip>
                <Tooltip title="Most recent report update" placement="top" arrow>
                  <Chip
                    icon={<Schedule fontSize="small" />}
                    label={`Last update ${lastUpdatedLabel}`}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'rgba(33, 33, 33, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--fx-text-secondary)',
                      letterSpacing: '0.12em',
                    }}
                  />
                </Tooltip>
                {searchTerm.trim() && (
                  <Chip
                    label={`Filter: "${searchTerm.trim()}"`}
                    onDelete={() => setSearchTerm('')}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      color: 'var(--fx-text-secondary)',
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Box>
  </Box>

      {alert && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert(null)}
          sx={{
            mt: 3,
            borderRadius: 2,
            border: '1px solid rgba(255, 152, 0, 0.32)',
            backgroundColor: 'rgba(255, 152, 0, 0.14)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            color: 'var(--fx-text-primary)',
          }}
        >
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={360}>
          <CircularProgress color="warning" />
        </Box>
      ) : reports.length === 0 ? (
        <Box
          className="fx-glass-card"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={320}
          textAlign="center"
          sx={{
            color: 'var(--fx-text-secondary)',
            borderRadius: 3,
            py: 7,
            px: { xs: 3, md: 6 },
          }}
        >
          <PersonIcon sx={{ fontSize: 72, mb: 2, color: 'rgba(255, 255, 255, 0.35)' }} />
          <Typography variant="h6">{emptyStateCopy}</Typography>
        </Box>
      ) : visibleReports.length === 0 ? (
        <Box
          className="fx-glass-card"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={320}
          textAlign="center"
          sx={{
            color: 'var(--fx-text-secondary)',
            borderRadius: 3,
            py: 7,
            px: { xs: 3, md: 6 },
          }}
        >
          <Search sx={{ fontSize: 72, mb: 2, color: 'rgba(255, 255, 255, 0.35)' }} />
          <Typography variant="h6">No reports match "{searchTerm.trim()}".</Typography>
          <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 360 }}>
            Try adjusting your search terms or clear the filter to see all {activeTabLabel.toLowerCase()}.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={4}>
          {visibleReports.map((person) => (
            <Card key={person._id} className="fx-glass-card" sx={surfaceStyles}>
              <Stack direction={{ xs: 'column', sm: 'row' }}>
                <CardMedia
                  component="div"
                  sx={{
                    minWidth: { xs: '100%', sm: 260 },
                    maxWidth: { xs: '100%', sm: 260 },
                    height: 240,
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: { sm: '1px solid rgba(255, 255, 255, 0.08)' },
                  }}
                >
                  {getImageSrc(person) ? (
                    <img
                      src={getImageSrc(person)}
                      alt={person.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                      <PersonIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.45)' }} />
                  )}
                </CardMedia>

                <CardContent sx={{ flexGrow: 1, p: { xs: 3.5, md: 4.5 } }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {person.name}
                    </Typography>
                    <Chip
                      label={person.approvalStatus?.toUpperCase() || 'UNKNOWN'}
                      size="small"
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        borderColor:
                          activeTab === 'pending'
                            ? 'rgba(255, 193, 7, 0.45)'
                            : 'rgba(76, 175, 80, 0.45)',
                        color:
                          activeTab === 'pending'
                            ? 'rgba(255, 193, 7, 0.88)'
                            : 'rgba(76, 175, 80, 0.88)',
                        backgroundColor:
                          activeTab === 'pending'
                            ? 'rgba(255, 193, 7, 0.12)'
                            : 'rgba(76, 175, 80, 0.12)',
                        borderRadius: 1.5,
                        borderWidth: 1,
                        borderStyle: 'solid',
                      }}
                    />
                  </Stack>

                  <Typography variant="body2" sx={{ mb: 1.5, color: 'var(--fx-text-secondary)' }}>
                    Reported on {new Date(person.createdAt).toLocaleString()}
                  </Typography>

                  <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Place fontSize="small" sx={{ color: 'var(--fx-accent)' }} />
                      <Typography variant="body2" sx={{ color: 'var(--fx-text-primary)' }}>
                        Last seen at {person.lastSeenLocation?.address || person.address}
                      </Typography>
                    </Stack>
                    {person.lastSeenAt && (
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Schedule fontSize="small" sx={{ color: 'var(--fx-accent)' }} />
                        <Typography variant="body2" sx={{ color: 'var(--fx-text-primary)' }}>
                          Last seen on {new Date(person.lastSeenAt).toLocaleString()}
                        </Typography>
                      </Stack>
                    )}
                    {person.lastSeenNotes && (
                      <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                        Notes: {person.lastSeenNotes}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: 'var(--fx-text-secondary)' }}>
                      Adhaar: {person.adhaarNumber}
                    </Typography>
                  </Stack>
                </CardContent>
              </Stack>

              <CardActions
                sx={{
                  justifyContent: 'space-between',
                  px: { xs: 3, md: 4.5 },
                  pb: 3.5,
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Stack direction="row" spacing={1.5} flexWrap="wrap" rowGap={1.5}>
                  <Chip
                    variant="outlined"
                    size="small"
                    icon={<PersonIcon fontSize="small" />}
                    label={`Reported by ${person.reportedBy?.firstName || 'Unknown'}`}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: 'var(--fx-text-secondary)',
                      borderRadius: 1.5,
                    }}
                  />
                  <Chip
                    variant="outlined"
                    size="small"
                    icon={<CheckCircleOutline fontSize="small" />}
                    label={`Status: ${person.status || 'active'}`}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: 'var(--fx-text-secondary)',
                      borderRadius: 1.5,
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  {activeTab === 'pending' && (
                    <PrimaryButton
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleOutline />}
                      onClick={() => handleApprove(person._id)}
                      size="small"
                    >
                      Approve report
                    </PrimaryButton>
                  )}
                  <PrimaryButton
                    variant="outlined"
                    color="success"
                    startIcon={<DoneAll />}
                    onClick={() => handleMarkFound(person._id, person.name)}
                    size="small"
                  >
                    Mark Found
                  </PrimaryButton>
                </Stack>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 6 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'var(--fx-text-secondary)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Viewing {visibleReports.length} of {reports.length} {activeTabLabel.toLowerCase()}.
        </Typography>
      </Box>
    </Stack>
    </Container>
  );
};

export default MissingPersonsAdmin;
