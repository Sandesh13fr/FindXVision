import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

import PrimaryButton from '../Common/PrimaryButton';

const roleColorMap = {
  ADMINISTRATOR: 'error',
  LAW_ENFORCEMENT: 'primary',
  GENERAL_USER: 'default',
};

const statusColorMap = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  SUSPENDED: 'error',
};

const UserManagement = ({ users, onUserEdit, onUserDelete, onUserSuspend, onUserActivate, onUserCreate, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term);

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuOpen = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setActiveUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setActiveUser(null);
  };

  const formatDate = (value) => {
    if (!value) return 'Never';
    return new Date(value).toLocaleDateString();
  };

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h6">User Management</Typography>
          <PrimaryButton startIcon={<PersonAddIcon />} onClick={onUserCreate}>
            Add User
          </PrimaryButton>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Search by name, email or department"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            size="small"
            fullWidth
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              label="Role"
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="ALL">All roles</MenuItem>
              <MenuItem value="ADMINISTRATOR">Administrator</MenuItem>
              <MenuItem value="LAW_ENFORCEMENT">Law enforcement</MenuItem>
              <MenuItem value="GENERAL_USER">General user</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar src={user.avatarUrl}>{user.firstName[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2">{`${user.firstName} ${user.lastName}`}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.department || 'No department'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role.replace('_', ' ')} color={roleColorMap[user.role] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={statusColorMap[user.status] || 'default'}
                      size="small"
                      variant={user.status === 'ACTIVE' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(event) => handleMenuOpen(event, user)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedUsers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No users match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose} keepMounted>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onUserEdit(activeUser);
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit details
          </MenuItem>
          {activeUser?.status === 'ACTIVE' ? (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onUserSuspend(activeUser.id);
              }}
            >
              <BlockIcon fontSize="small" sx={{ mr: 1 }} /> Suspend
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onUserActivate(activeUser.id);
              }}
            >
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Activate
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onUserDelete(activeUser.id);
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default UserManagement;

