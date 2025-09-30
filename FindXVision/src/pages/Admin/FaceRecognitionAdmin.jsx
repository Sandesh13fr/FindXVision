import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VideocamIcon from '@mui/icons-material/Videocam';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import UploadPanel from '../../components/FaceRecognition/UploadPanel';
import LiveCameraPanel from '../../components/FaceRecognition/LiveCameraPanel';
import MatchesBoard from '../../components/FaceRecognition/MatchesBoard';
import { faceAPI } from '../../services/api';

const createEmptySnackbar = () => ({ open: false, message: '', severity: 'info' });

const normalizeEntry = (entry, sourceHint) => {
  if (!entry) return null;
  const name = entry.personName || entry.name || 'Unknown';
  const timestamp = entry.captureTime || entry.timestamp || new Date().toISOString();
  return {
    name,
    confidence: entry.confidence ?? 0,
    frame: entry.frame ?? entry.frameNumber ?? null,
    thumbnail: entry.thumbnail || null,
    source: entry.source || sourceHint || 'image',
    timestamp,
  };
};

const mergeMatches = (current, entries) => {
  const map = new Map(current.map((item) => [item.name, { ...item, sources: [...(item.sources || [])] }]));

  entries
    .map((raw) => normalizeEntry(raw))
    .filter(Boolean)
    .forEach((entry) => {
      const when = new Date(entry.timestamp).toISOString();
      const record = map.get(entry.name);
      if (!record) {
        map.set(entry.name, {
          name: entry.name,
          confidence: entry.confidence,
          firstSeen: when,
          lastSeen: when,
          firstFrame: entry.frame ?? undefined,
          lastFrame: entry.frame ?? undefined,
          thumbnail: entry.thumbnail,
          count: 1,
          sources: entry.source ? [entry.source] : [],
        });
        return;
      }

      record.confidence = Math.max(record.confidence ?? 0, entry.confidence ?? 0);
      if (when < record.firstSeen) record.firstSeen = when;
      if (when > record.lastSeen) record.lastSeen = when;

      if (entry.frame !== null && entry.frame !== undefined) {
        if (record.firstFrame === undefined || entry.frame < record.firstFrame) record.firstFrame = entry.frame;
        if (record.lastFrame === undefined || entry.frame > record.lastFrame) record.lastFrame = entry.frame;
      }

      if (!record.thumbnail && entry.thumbnail) {
        record.thumbnail = entry.thumbnail;
      }

      record.count = (record.count || 0) + 1;

      if (entry.source && !record.sources.includes(entry.source)) {
        record.sources = [...record.sources, entry.source];
      }
    });

  return Array.from(map.values()).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
};

const FaceRecognitionAdmin = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [detectionsLoading, setDetectionsLoading] = useState(false);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [uploadProcessing, setUploadProcessing] = useState({ active: false, fileName: '' });
  const [snackbar, setSnackbar] = useState(createEmptySnackbar);

  const closeSnackbar = useCallback(() => setSnackbar(createEmptySnackbar()), []);
  const showMessage = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const { data } = await faceAPI.getStatus();
      setStatus(data.status || data);
    } catch (error) {
      console.error('Failed to retrieve face service status', error);
      showMessage('Unable to connect to face recognition service', 'error');
    } finally {
      setStatusLoading(false);
    }
  }, [showMessage]);

  const loadDetections = useCallback(async () => {
    setDetectionsLoading(true);
    try {
      const { data } = await faceAPI.getDetections({ limit: 200 });
      const items = data.items || [];
      setMatches(mergeMatches([], items));
    } catch (error) {
      console.error('Failed to load detection history', error);
      showMessage('Failed to load detections history', 'error');
    } finally {
      setDetectionsLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadStatus();
    loadDetections();
  }, [loadStatus, loadDetections]);

  const refreshDetections = useCallback(async () => {
    setMatches([]);
    await loadDetections();
  }, [loadDetections]);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      showMessage('Geolocation is not supported by this browser', 'warning');
      return null;
    }
    setLocationLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setLocation(coords);
          setLocationLoading(false);
          resolve(coords);
        },
        () => {
          setLocationLoading(false);
          showMessage('Unable to access location', 'warning');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 },
      );
    });
  }, [showMessage]);

  useEffect(() => {
    if (includeLocation && !location && !locationLoading) {
      requestLocation();
    }
  }, [includeLocation, location, locationLoading, requestLocation]);

  const handleImageProcess = useCallback(async (file) => {
    setUploadProcessing({ active: true, fileName: file?.name || 'image' });
    const formData = new FormData();
    formData.append('file', file);
    if (includeLocation && location) {
      formData.append('lat', location.lat);
      formData.append('lon', location.lon);
      if (location.accuracy) formData.append('accuracy', location.accuracy);
    }

    try {
      const { data } = await faceAPI.uploadImage(formData);
      if (data?.matches?.length) {
        const enriched = data.matches.map((match) => ({
          ...match,
          source: 'image',
          timestamp: new Date().toISOString(),
        }));
        setMatches((prev) => mergeMatches(prev, enriched));
        showMessage(`Match Found! ${data.matches.length} face(s) identified`, 'success');
        await refreshDetections();
      } else {
        showMessage('No matches found in image', 'warning');
      }
    } finally {
      setUploadProcessing({ active: false, fileName: '' });
    }
  }, [includeLocation, location, refreshDetections, showMessage]);

  const handleVideoProcess = useCallback(async (file) => {
    setUploadProcessing({ active: true, fileName: file?.name || 'video' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await faceAPI.uploadVideo(formData);
      if (data?.matches?.length) {
        const enriched = data.matches.map((match) => ({
          ...match,
          source: 'video',
          timestamp: new Date().toISOString(),
        }));
        setMatches((prev) => mergeMatches(prev, enriched));
        showMessage(`Match Found! ${data.matches.length} face(s) identified`, 'success');
        await refreshDetections();
      } else {
        showMessage('No matches detected in sampled video frames', 'warning');
      }
    } finally {
      setUploadProcessing({ active: false, fileName: '' });
    }
  }, [refreshDetections, showMessage]);

  const handleLiveMatch = useCallback((match) => {
    const enriched = [{ ...match, source: 'live' }];
    setMatches((prev) => mergeMatches(prev, enriched));
    refreshDetections();
  }, [refreshDetections]);

  const statusSummary = useMemo(() => {
    if (!status) return null;
    const entries = [];
    if (typeof status.known_faces === 'number') {
      entries.push({ label: 'Known faces', value: status.known_faces });
    }
    if (status.tolerance) {
      entries.push({ label: 'Tolerance', value: status.tolerance });
    }
    if (status.version) {
      entries.push({ label: 'Service', value: status.version });
    }
    return entries;
  }, [status]);

  return (
    <Box sx={{ flexGrow: 1, background: '#0d0d0d', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
              Face Recognition Console
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Manage live recognition, media uploads, and review matches synced to MongoDB.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '18px',
              background: 'rgba(26,26,26,0.85)',
              border: '1px solid rgba(255,149,0,0.12)',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <AssessmentIcon sx={{ color: '#ffb347' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                  Service Status
                </Typography>
                {statusLoading && <CircularProgress size={18} sx={{ color: '#ffb347' }} />}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(statusSummary || []).map((item) => (
                  <Chip
                    key={item.label}
                    label={`${item.label}: ${item.value}`}
                    sx={{ background: 'rgba(255,149,0,0.15)', color: '#ffb347', fontWeight: 600 }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Attach device location
                </Typography>
                <Tooltip title="Location is stored with matches for better triage.">
                  <Switch
                    checked={includeLocation}
                    onChange={(event) => {
                      setIncludeLocation(event.target.checked);
                      if (!event.target.checked) {
                        setLocation(null);
                      }
                    }}
                    color="warning"
                  />
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: '18px',
              background: 'rgba(26,26,26,0.9)',
              border: '1px solid rgba(255,149,0,0.12)',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.65)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                },
                '& .Mui-selected': {
                  color: '#fff !important',
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  background: 'linear-gradient(90deg, #ff9500, #ffb347)',
                },
              }}
            >
              <Tab label="Upload Image" value="image" icon={<UploadFileIcon />} iconPosition="start" />
              <Tab label="Upload Video" value="video" icon={<VideocamIcon />} iconPosition="start" />
              <Tab label="Live Camera" value="live" icon={<FaceRetouchingNaturalIcon />} iconPosition="start" />
            </Tabs>

            {activeTab === 'image' && (
              <UploadPanel
                mode="image"
                onProcess={handleImageProcess}
                disabled={(locationLoading && includeLocation) || uploadProcessing.active}
                locationPending={includeLocation && locationLoading}
                location={location}
                onRequestLocation={includeLocation ? requestLocation : undefined}
                processing={uploadProcessing.active}
                processingLabel={uploadProcessing.active ? `Processing ${uploadProcessing.fileName}…` : undefined}
              />
            )}
            {activeTab === 'video' && (
              <UploadPanel
                mode="video"
                onProcess={handleVideoProcess}
                disabled={(locationLoading && includeLocation) || uploadProcessing.active}
                locationPending={includeLocation && locationLoading}
                location={location}
                onRequestLocation={includeLocation ? requestLocation : undefined}
                processing={uploadProcessing.active}
                processingLabel={uploadProcessing.active ? `Processing ${uploadProcessing.fileName}…` : undefined}
              />
            )}
            {activeTab === 'live' && (
              <Box sx={{ p: 3 }}>
                <LiveCameraPanel
                  onMatch={handleLiveMatch}
                  onInfo={(message) => showMessage(message, 'success')}
                  onError={(message) => showMessage(message, 'error')}
                  requestLocation={includeLocation ? requestLocation : undefined}
                  includeLocation={includeLocation}
                  processFrame={faceAPI.processFrame}
                />
              </Box>
            )}
          </Paper>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
              Recent Matches
            </Typography>
            {detectionsLoading && <CircularProgress size={18} sx={{ color: '#ffb347' }} />}
          </Stack>

          <MatchesBoard matches={matches} />
        </Stack>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FaceRecognitionAdmin;
