import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Webcam from 'react-webcam'
import { Box, Button, Chip, Container, Paper, Stack, Tab, Tabs, Typography, Snackbar, Alert, Divider } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural'
import StopIcon from '@mui/icons-material/Stop'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

const api = axios.create({ baseURL: '/api' })

function Popup({ open, message, severity = 'success', onClose }) {
  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={onClose} severity={severity} sx={{ fontWeight: 700 }}>
        {message}
      </Alert>
    </Snackbar>
  )
}

const getDropzoneStyles = (isActive) => ({
  border: '1px dashed rgba(255,149,0,0.5)',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center',
  background: isActive ? 'rgba(255,149,0,0.08)' : 'rgba(255,149,0,0.04)',
  transition: 'all 0.2s ease',
})

function DropUpload({ kind, onSubmit, disabled, processingLabel }) {
  const [file, setFile] = useState(null)
  const [localProcessing, setLocalProcessing] = useState(false)
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const accept = kind === 'image' ? 'image/*' : 'video/*'

  const onPick = (e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) setFile(f)
  }

  const submit = async () => {
    if (!file || localProcessing) return
    setLocalProcessing(true)
    try {
      await onSubmit(file)
    } finally {
      setLocalProcessing(false)
    }
  }

  const label = processingLabel || (kind === 'image' ? 'Process Image' : 'Process Video')

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Box
        onClick={() => !disabled && !localProcessing && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        sx={getDropzoneStyles(dragOver)}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff', mb: 1 }}>
          Drop a {kind} or click to upload
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {kind === 'image' ? 'Supported formats: JPG, PNG, BMP, WEBP' : 'Supported formats: MP4, MOV, AVI, MKV, WEBM'}
        </Typography>
        {file && (
          <Chip label={`${file.name} • ${(file.size/1024/1024).toFixed(2)} MB`} sx={{ mt: 2, background: 'rgba(255,149,0,0.15)', color: '#fff', fontWeight: 600 }} />
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={onPick} disabled={disabled || localProcessing} style={{ display: 'none' }} />
      </Box>

      <Button
        variant="contained"
        disabled={!file || disabled || localProcessing}
        onClick={submit}
        sx={{
          alignSelf: 'flex-start',
          fontWeight: 800,
          px: 3,
          py: 1.2,
          background: 'linear-gradient(135deg, #ff9500, #ffb347)',
          color: '#000',
          '&:hover': { background: 'linear-gradient(135deg, #ffad33, #ffc870)' },
        }}
      >
        {kind === 'image' ? <CloudUploadIcon sx={{ mr: 1 }} /> : <PlayArrowIcon sx={{ mr: 1 }} />}
        {localProcessing ? (processingLabel || 'Processing…') : label}
      </Button>
    </Stack>
  )
}

export default function App() {
  const [active, setActive] = useState('image')
  const [status, setStatus] = useState(null)
  const [popup, setPopup] = useState({ open: false, message: '', severity: 'info' })
  const [matches, setMatches] = useState([])
  const [uploadProcessing, setUploadProcessing] = useState({ active: false, fileName: '' })
  const webcamRef = useRef(null)
  const intervalRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [flash, setFlash] = useState(false)
  const [lastLiveMatch, setLastLiveMatch] = useState(null)

  const closePopup = () => setPopup({ open: false, message: '', severity: 'info' })
  const showPopup = (message, severity = 'success') => setPopup({ open: true, message, severity })

  const getStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/health')
      setStatus(data)
    } catch (e) {
      setStatus(null)
      showPopup('Unable to connect to face service', 'error')
    }
  }, [])

  useEffect(() => { getStatus() }, [getStatus])

  const handleImage = useCallback(async (file) => {
    setUploadProcessing({ active: true, fileName: file?.name || 'image' })
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/process-image', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 })
      if (data?.matched && data?.matches?.length) {
        setMatches((prev) => [...prev, ...data.matches.map(m => ({ ...m, source: 'image', timestamp: new Date().toISOString() }))])
        showPopup(`Match Found! ${data.matches.length} face(s) identified`, 'success')
      } else {
        showPopup('No matches found in image', 'warning')
      }
    } finally {
      setUploadProcessing({ active: false, fileName: '' })
    }
  }, [])

  const handleVideo = useCallback(async (file) => {
    setUploadProcessing({ active: true, fileName: file?.name || 'video' })
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/process-video', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 240000 })
      if (data?.matched && data?.matches?.length) {
        setMatches((prev) => [...prev, ...data.matches.map(m => ({ ...m, source: 'video', timestamp: new Date().toISOString() }))])
        showPopup(`Match Found! ${data.matches.length} face(s) identified`, 'success')
      } else {
        showPopup('No matches detected in video', 'warning')
      }
    } finally {
      setUploadProcessing({ active: false, fileName: '' })
    }
  }, [])

  // Live camera controls
  const startCamera = useCallback(async () => {
    try {
      // react-webcam will request camera when mounted
      setIsStreaming(true)
    } catch (e) {
      showPopup('Camera permission denied or unavailable', 'error')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const stream = webcamRef.current?.stream
    if (stream) {
      try { stream.getTracks().forEach(t => t.stop()) } catch (_) {}
    }
    setIsStreaming(false)
    setFlash(false)
  }, [])

  useEffect(() => {
    if (!isStreaming) return () => {}

    intervalRef.current = setInterval(async () => {
      const cam = webcamRef.current
      if (!cam) return
      const frame = cam.getScreenshot({ width: 640, height: 480 })
      if (!frame) return
      try {
        const { data } = await api.post('/process-frame', {
          frame,
          frameNumber: Date.now(),
          timestamp: new Date().toISOString(),
        }, { timeout: 20000 })
        if (data?.matched && data?.face_data) {
          const { name, confidence, timestamp } = data.face_data
          setFlash(true)
          setTimeout(() => setFlash(false), 350)
          showPopup(`Face captured! Match found for ${name}`, 'success')
          setLastLiveMatch({ name, confidence, thumbnail: frame, source: 'live', timestamp: timestamp || new Date().toISOString() })
        }
      } catch (e) {
        // Silently ignore transient errors (rate limit/network)
      }
    }, 750)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isStreaming])

  useEffect(() => () => stopCamera(), [stopCamera])

  // Stop camera when leaving the Live tab
  useEffect(() => {
    if (active !== 'live' && isStreaming) {
      stopCamera()
    }
  }, [active, isStreaming, stopCamera])

  // Simple matches board
  const board = (
    <Stack spacing={2} sx={{ mt: 3 }}>
      {matches.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', borderColor: 'rgba(255,149,0,0.25)', bgcolor: 'rgba(255,149,0,0.05)' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>No matches recorded yet.</Typography>
        </Paper>
      ) : (
        matches.slice().reverse().map((m, idx) => (
          <Paper key={idx} sx={{ p: 2, borderRadius: '18px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(255,149,0,0.25)', bgcolor: 'rgba(26,26,26,0.85)', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }}>
            {m.thumbnail && <img src={m.thumbnail} alt={m.name} style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{m.name}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Confidence {m.confidence?.toFixed?.(1) ?? m.confidence}% • {m.source?.toUpperCase?.()}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{new Date(m.timestamp).toLocaleString()}</Typography>
            </Box>
          </Paper>
        ))
      )}
    </Stack>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0d0d0d', color: '#fff', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Face Recognition Console</Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Manage uploads and review matches.
            </Typography>
          </Box>

          {/* Service Status */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '18px',
              background: 'rgba(26,26,26,0.85)',
              border: '1px solid rgba(255,149,0,0.12)'
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>Service Status</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {status && (
                  <>
                    <Chip label={`Known faces: ${status.known_faces}`} sx={{ background: 'rgba(255,149,0,0.15)', color: '#ffb347', fontWeight: 600 }} />
                    <Chip label={`Tolerance: ${status.tolerance ?? 0.6}`} sx={{ background: 'rgba(255,149,0,0.15)', color: '#ffb347', fontWeight: 600 }} />
                  </>
                )}
              </Stack>
            </Stack>
          </Paper>

          {/* Tabs + Upload Panels */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '18px',
              background: 'rgba(26,26,26,0.9)',
              border: '1px solid rgba(255,149,0,0.12)'
            }}
          >
            <Tabs
              value={active}
              onChange={(_, v) => setActive(v)}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.65)',
                  fontWeight: 600,
                  textTransform: 'none',
                },
                '& .Mui-selected': { color: '#fff !important' },
                '& .MuiTabs-indicator': { height: 3, background: 'linear-gradient(90deg, #ff9500, #ffb347)' },
              }}
            >
              <Tab label="Upload Image" value="image" icon={<CloudUploadIcon />} iconPosition="start" />
              <Tab label="Upload Video" value="video" icon={<PlayArrowIcon />} iconPosition="start" />
              <Tab label="Live Camera" value="live" icon={<FaceRetouchingNaturalIcon />} iconPosition="start" />
            </Tabs>

            {active === 'image' && (
              <DropUpload
                kind="image"
                onSubmit={handleImage}
                disabled={uploadProcessing.active}
                processingLabel={uploadProcessing.active ? `Processing ${uploadProcessing.fileName}…` : undefined}
              />
            )}
            {active === 'video' && (
              <DropUpload
                kind="video"
                onSubmit={handleVideo}
                disabled={uploadProcessing.active}
                processingLabel={uploadProcessing.active ? `Processing ${uploadProcessing.fileName}…` : undefined}
              />
            )}
            {active === 'live' && (
              <Box sx={{ p: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '18px',
                    background: 'rgba(26,26,26,0.85)',
                    border: '1px solid rgba(255,149,0,0.15)'
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CameraAltIcon sx={{ color: '#ffb347' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Live Camera</Typography>
                    </Stack>
                    <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,149,0,0.25)', boxShadow: flash ? '0 0 24px rgba(76, 175, 80, 0.6)' : '0 12px 24px rgba(0,0,0,0.4)', maxWidth: 640 }}>
                      {isStreaming ? (
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          videoConstraints={{ width: 640, height: 480 }}
                          screenshotFormat="image/jpeg"
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <Box sx={{ width: '100%', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(255,149,0,0.1), rgba(0,0,0,0.6))' }}>
                          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Click "Start Camera" to begin scanning
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: flash ? 'rgba(76,175,80,0.25)' : 'transparent', transition: 'background 0.25s ease' }} />
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button
                        startIcon={<PlayArrowIcon />}
                        variant="contained"
                        onClick={startCamera}
                        disabled={isStreaming}
                        sx={{ background: 'linear-gradient(135deg, #ff9500, #ffb347)', color: '#000', fontWeight: 700, px: 3, '&:hover': { background: 'linear-gradient(135deg, #ffad33, #ffc870)' } }}
                      >
                        Start Camera
                      </Button>
                      <Button
                        startIcon={<StopIcon />}
                        variant="outlined"
                        onClick={stopCamera}
                        disabled={!isStreaming}
                        sx={{ borderColor: 'rgba(255,149,0,0.5)', color: '#ffb347', fontWeight: 600, px: 3, '&:hover': { borderColor: '#ffb347', background: 'rgba(255,149,0,0.08)' } }}
                      >
                        Stop Camera
                      </Button>
                    </Stack>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Last Match</Typography>
                      {!lastLiveMatch ? (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', borderColor: 'rgba(255,149,0,0.25)', bgcolor: 'rgba(255,149,0,0.05)' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>No live match yet.</Typography>
                        </Paper>
                      ) : (
                        <Paper sx={{ p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(255,149,0,0.25)', bgcolor: 'rgba(26,26,26,0.85)' }}>
                          {lastLiveMatch.thumbnail && (
                            <img src={lastLiveMatch.thumbnail} alt={lastLiveMatch.name} style={{ width: 112, height: 112, objectFit: 'cover', borderRadius: 8 }} />
                          )}
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{lastLiveMatch.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              Confidence {lastLiveMatch.confidence?.toFixed?.(1) ?? lastLiveMatch.confidence}% • LIVE
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              {new Date(lastLiveMatch.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            )}
          </Paper>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          <Typography variant="h5" sx={{ fontWeight: 800 }}>Recent Matches</Typography>
          {board}
        </Stack>
      </Container>

      <Popup open={popup.open} message={popup.message} severity={popup.severity} onClose={closePopup} />
    </Box>
  )
}
