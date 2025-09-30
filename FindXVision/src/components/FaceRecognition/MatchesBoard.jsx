import React from 'react'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

export default function MatchesBoard({ matches = [] }) {
  if (!matches?.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', borderColor: 'rgba(255,149,0,0.25)', bgcolor: 'rgba(255,149,0,0.05)' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>No matches recorded yet.</Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={2}>
      {matches.map((m, idx) => (
        <Paper key={`${m.name}-${idx}`} sx={{ p: 2, borderRadius: '18px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(255,149,0,0.25)', bgcolor: 'rgba(26,26,26,0.85)', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }}>
          {m.thumbnail && (
            <img src={m.thumbnail} alt={m.name} style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{m.name}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Confidence {m.confidence?.toFixed?.(1) ?? m.confidence}%
              {m.sources?.length ? ` • ${m.sources.join(', ').toUpperCase?.()}` : (m.source ? ` • ${m.source.toUpperCase?.()}` : '')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {m.firstSeen || m.lastSeen ? (
                <>First: {new Date(m.firstSeen || m.timestamp).toLocaleString()} • Last: {new Date(m.lastSeen || m.timestamp).toLocaleString()}</>
              ) : new Date(m.timestamp).toLocaleString()}
            </Typography>
          </Box>
          {m.count ? (
            <Chip label={`Seen ${m.count}x`} sx={{ background: 'rgba(255,149,0,0.15)', color: '#ffb347', fontWeight: 600 }} />
          ) : null}
        </Paper>
      ))}
    </Stack>
  )
}
