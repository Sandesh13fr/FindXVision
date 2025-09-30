import React, { useRef, useState } from 'react'
import { Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

const getDropzoneStyles = (active) => ({
  border: '1px dashed rgba(255,149,0,0.5)',
  borderRadius: 16,
  padding: 32,
  textAlign: 'center',
  background: active ? 'rgba(255,149,0,0.08)' : 'rgba(255,149,0,0.04)',
  transition: 'all 0.2s ease',
})

export default function UploadPanel({
  mode = 'image',
  onProcess,
  disabled,
  processing = false,
  processingLabel,
  locationPending = false,
  location,
  onRequestLocation,
}) {
  const [file, setFile] = useState(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const accept = mode === 'image' ? 'image/*' : 'video/*'

  const pick = (e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }
  const drop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDrag(false)
    const f = e.dataTransfer?.files?.[0]
    if (f) setFile(f)
  }

  const submit = async () => {
    if (!file || !onProcess) return
    await onProcess(file)
  }

  const label = mode === 'image' ? 'Process Image' : 'Process Video'

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2.25, background: 'rgba(26,26,26,0.85)', border: '1px solid rgba(255,149,0,0.15)' }}>
        <Stack spacing={2}>
          <Box
            onClick={() => !disabled && !processing && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={drop}
            sx={getDropzoneStyles(drag)}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff', mb: 1 }}>
              Drop a {mode} or click to upload
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {mode === 'image' ? 'Supported formats: JPG, PNG, BMP, WEBP' : 'Supported formats: MP4, MOV, AVI, MKV, WEBM'}
            </Typography>
            {file && (
              <Chip label={`${file.name} • ${(file.size/1024/1024).toFixed(2)} MB`} sx={{ mt: 2, background: 'rgba(255,149,0,0.15)', color: '#fff', fontWeight: 600 }} />
            )}
            <input ref={inputRef} type="file" accept={accept} onChange={pick} disabled={disabled || processing} style={{ display: 'none' }} />
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              disabled={!file || disabled || processing}
              onClick={submit}
              sx={{ fontWeight: 800, px: 3, py: 1.2, background: 'linear-gradient(135deg, #ff9500, #ffb347)', color: '#000', '&:hover': { background: 'linear-gradient(135deg, #ffad33, #ffc870)' } }}
            >
              {mode === 'image' ? <CloudUploadIcon sx={{ mr: 1 }} /> : <PlayArrowIcon sx={{ mr: 1 }} />}
              {processing ? (processingLabel || 'Processing…') : label}
            </Button>
            {locationPending && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} sx={{ color: '#ffb347' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Fetching location…</Typography>
              </Stack>
            )}
            {onRequestLocation && !location && !locationPending && (
              <Button variant="text" onClick={onRequestLocation} sx={{ color: '#ffb347', fontWeight: 700 }}>Attach Location</Button>
            )}
            {location && (
              <Chip size="small" label={`Location: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`} sx={{ background: 'rgba(255,149,0,0.15)', color: '#ffb347', fontWeight: 600 }} />
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
