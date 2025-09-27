import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';

import PrimaryButton from '../Common/PrimaryButton';

const getTrendColor = (type) => (type === 'increase' ? 'success' : 'error');

const StatCard = ({ title, value, change, subtitle, color = 'primary', icon, progress, tooltip }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {tooltip && (
              <Tooltip title={tooltip}>
                <IconButton size="small">
                  <Info fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Typography variant="h3" component="div" color={`${color}.main`} fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        )}
      </Box>

      {change && (
        <Chip
          icon={change.type === 'increase' ? <TrendingUp /> : <TrendingDown />}
          label={`${change.value > 0 ? '+' : ''}${change.value}% ${change.period}`}
          color={getTrendColor(change.type)}
          size="small"
        />
      )}

      {progress !== undefined && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} color={color} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}
    </CardContent>
  </Card>
);

const AnalyticsOverview = ({ data, trends, onReviewInsights }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Total Cases"
        value={data.totalCases.toLocaleString()}
        change={trends.cases}
        subtitle="Including active & resolved"
        color="warning"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Resolved Cases"
        value={data.resolvedCases.toLocaleString()}
        change={trends.resolutions}
        subtitle="Last 30 days"
        color="success"
        progress={Math.round((data.resolvedCases / data.totalCases) * 100)}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Active Volunteers"
        value={data.activeVolunteers.toLocaleString()}
        change={trends.volunteers}
        subtitle="City-wide"
        color="info"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <StatCard
        title="Alerts Today"
        value={data.alertsToday}
        change={trends.alerts}
        subtitle="Awaiting triage"
        color="secondary"
      />
    </Grid>

    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Weekly performance snapshot
              </Typography>
              <Typography variant="body1">
                Response teams resolved {data.weeklySummary.resolved}% of reported cases in an average of
                {` ${data.weeklySummary.avgResolutionHours} hours.`}
              </Typography>
            </Box>
            <PrimaryButton onClick={onReviewInsights}>Review insights</PrimaryButton>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

export default AnalyticsOverview;

