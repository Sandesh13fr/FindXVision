import React, { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Box, Button, Paper, Stack, Typography, Chip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

export default function LiveCameraPanel({ onMatch, onInfo, onError, processFrame, includeLocation, requestLocation }) {
  const webcamRef = useRef(null)
  const intervalRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [flash, setFlash] = useState(false)
  const [lastLiveMatch, setLastLiveMatch] = useState(null)
  const [locationStatus, setLocationStatus] = useState(null)

  const start = useCallback(async () => {
    try {
      if (includeLocation && requestLocation) {
        const coords = await requestLocation()
        if (coords) setLocationStatus(coords)
      }
      setIsStreaming(true)
    } catch (e) {
      onError?.('Camera permission denied or unavailable')
    }
  }, [includeLocation, requestLocation, onError])

  const stop = useCallback(() => {
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
        const payload = { frame, frameNumber: Date.now(), timestamp: new Date().toISOString() }
        if (includeLocation && locationStatus) {
          payload.lat = locationStatus.lat
          payload.lon = locationStatus.lon
          if (locationStatus.accuracy) payload.accuracy = locationStatus.accuracy
        }
        const { data } = await processFrame(payload)
        if (data?.matched && data?.face_data) {
          const { name, confidence, timestamp } = data.face_data
          setFlash(true)
          setTimeout(() => setFlash(false), 350)
          onInfo?.(`Face captured! Match found for ${name}`)
          const match = { name, confidence, thumbnail: frame, source: 'live', timestamp: timestamp || new Date().toISOString() }
          setLastLiveMatch(match)
          onMatch?.(match)
        }
      } catch (_) {
        // ignore transient errors
      }
    }, 750)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isStreaming, includeLocation, locationStatus, onInfo, onMatch, processFrame])

  useEffect(() => () => stop(), [stop])

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2.25, background: 'rgba(26,26,26,0.85)', border: '1px solid rgba(255,149,0,0.15)' }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CameraAltIcon sx={{ color: '#ffb347' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Live Camera</Typography>
          {locationStatus && (
            <Chip size="small" label={`Location set (${locationStatus.lat.toFixed(3)}, ${locationStatus.lon.toFixed(3)})`} sx={{ background: 'rgba(76,175,80,0.2)', color: '#4CAF50', fontWeight: 600 }} />
          )}
        </Stack>
        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,149,0,0.25)', boxShadow: flash ? '0 0 24px rgba(76, 175, 80, 0.6)' : '0 12px 24px rgba(0,0,0,0.4)', maxWidth: 640 }}>
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
          <Button startIcon={<PlayArrowIcon />} variant="contained" onClick={start} disabled={isStreaming} sx={{ background: 'linear-gradient(135deg, #ff9500, #ffb347)', color: '#000', fontWeight: 700, px: 3, '&:hover': { background: 'linear-gradient(135deg, #ffad33, #ffc870)' } }}>
            Start Camera
          </Button>
          <Button startIcon={<StopIcon />} variant="outlined" onClick={stop} disabled={!isStreaming} sx={{ borderColor: 'rgba(255,149,0,0.5)', color: '#ffb347', fontWeight: 600, px: 3, '&:hover': { borderColor: '#ffb347', background: 'rgba(255,149,0,0.08)' } }}>
            Stop Camera
          </Button>
        </Stack>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Last Match</Typography>
          {!lastLiveMatch ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.75, borderColor: 'rgba(255,149,0,0.25)', bgcolor: 'rgba(255,149,0,0.05)' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>No live match yet.</Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(255,149,0,0.25)', bgcolor: 'rgba(26,26,26,0.85)' }}>
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
  )
}
