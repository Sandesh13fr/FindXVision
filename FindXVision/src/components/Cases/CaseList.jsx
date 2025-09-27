import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import PrimaryButton from '../Common/PrimaryButton';

const statusOptions = ['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];
const priorityOptions = ['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];

const statusColorMap = {
  OPEN: 'error',
  INVESTIGATING: 'warning',
  RESOLVED: 'success',
  CLOSED: 'default',
};

const priorityColorMap = {
  URGENT: 'error',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'success',
};

const CaseList = ({ cases, loading, onEdit, onDelete, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeCase, setActiveCase] = useState(null);

  const filteredCases = useMemo(() => {
    return cases.filter((caseItem) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        caseItem.title?.toLowerCase().includes(term) ||
        caseItem.caseNumber?.toLowerCase().includes(term) ||
        `${caseItem?.missingPerson?.firstName || ''} ${caseItem?.missingPerson?.lastName || ''}`
          .toLowerCase()
          .includes(term);

      const matchesStatus = statusFilter === 'ALL' || caseItem.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || caseItem.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, priorityFilter, searchTerm, statusFilter]);

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveCase(null);
  };

  const openMenu = (event, caseItem) => {
    setMenuAnchor(event.currentTarget);
    setActiveCase(caseItem);
  };

  const handleEdit = () => {
    if (activeCase) {
      onEdit?.(activeCase);
    }
    closeMenu();
  };

  const handleDelete = () => {
    if (activeCase) {
      onDelete?.(activeCase._id || activeCase.id);
    }
    closeMenu();
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString();
    } catch (error) {
      return '—';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search cases"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{ minWidth: 140 }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Priority"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          sx={{ minWidth: 140 }}
        >
          {priorityOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <PrimaryButton variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
          Refresh
        </PrimaryButton>
      </Box>

      {filteredCases.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6">No cases match the current filters.</Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust the search or filters to see more results.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCases.map((caseItem) => (
            <Grid item xs={12} md={6} lg={4} key={caseItem._id || caseItem.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {caseItem.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Case #{caseItem.caseNumber || '—'}
                      </Typography>
                    </Box>
                    <IconButton onClick={(event) => openMenu(event, caseItem)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar>
                      {(caseItem?.missingPerson?.firstName || '?')[0] ?? '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">Missing Person</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {caseItem?.missingPerson
                          ? `${caseItem.missingPerson.firstName} ${caseItem.missingPerson.lastName}`
                          : 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={caseItem.status || 'UNKNOWN'}
                      color={statusColorMap[caseItem.status] || 'default'}
                      size="small"
                    />
                    <Chip
                      label={`Priority: ${caseItem.priority || 'N/A'}`}
                      color={priorityColorMap[caseItem.priority] || 'default'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Updated {formatDate(caseItem.updatedAt || caseItem.createdAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CaseList;

