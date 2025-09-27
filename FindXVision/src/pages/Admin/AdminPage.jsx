import React from 'react';
import  { Container, Typography, Paper, Box, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress, Tabs, Tab }  from '@mui/material';

         import PrimaryButton from '../../components/Common/PrimaryButton';
from '../../services/api';







const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // User management dialog
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const [usersResponse, casesResponse, statsResponse] = await Promise.all([
        adminAPI.getUsers(),
        casesAPI.getCases(),
        usersAPI.getUserStats(),
      ]);

      setUsers(usersResponse.data);
      setCases(casesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setAlert({ type: 'error', message: 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserFormData({
    setUserDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        await adminAPI.updateUser(selectedUser._id, userFormData);
        setAlert({ type: 'success', message: 'User updated successfully!' });
      } else {
        // Note: This would need a create user endpoint
        setAlert({ type: 'error', message: 'User creation not implemented yet.' });
        return;
      setUserDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to save user:', error);
      setAlert({
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Note: This would need a delete user endpoint
        setAlert({ type: 'error', message: 'User deletion not implemented yet.' });
      } catch (error) {
        console.error('Failed to delete user:', error);
        setAlert({ type: 'error', message: 'Failed to delete user.' });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'error';
      case 'LAW_ENFORCEMENT':
        return 'warning';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'open':
        return 'success';
      case 'resolved':
      case 'closed':
        return 'default';
      case 'pending':
        return 'warning';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Total Users
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalUsers}
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Total Cases
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalCases}
                      </Typography>
                    </Box>
                    <AssignmentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Active Cases
                      </Typography>
                      <Typography variant="h4">
                        {stats.activeCases}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Resolved Cases
                      </Typography>
                      <Typography variant="h4">
                        {stats.resolvedCases}
                      </Typography>
                    </Box>
                    <SecurityIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Users" />
            <Tab label="Cases" />
            <Tab label="System Settings" />
          </Tabs>
        </Paper>

        {/* Users Tab */}
        {activeTab === 0 && (
          
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">User Management
              <PrimaryButton variant="contained" startIcon={<AddIcon />} onClick={handleCreateUser}>
                Add User
              </PrimaryButton>
            </Box>
            Name
                    Email
                    Role
                    Status
                    Created
                    Actions
                  </TableRow>
                </TableHead>
                
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      
                        {user.firstName} {user.lastName}
                      </TableCell>
                      {user.email}</TableCell>
                      
                        <Chip
                          label={user.role.replace('_', ' ')}
                          color={getRoleColor(user.role) }
                          size="small"
                        />
                      </TableCell>
                      
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      
                        <PrimaryButton
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </PrimaryButton>
                        <PrimaryButton
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteUser(user._id)}
                          sx={{ ml: 1 }}
                        >
                          Delete
                        </PrimaryButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Cases Tab */}
        {activeTab === 1 && (
          
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Case Management
            </Box>
            Title
                    Status
                    Assigned Officer
                    Created
                    Actions
                  </TableRow>
                </TableHead>
                
                  {cases.slice(0, 20).map((caseItem) => (
                    <TableRow key={caseItem._id}>
                      {caseItem.title}</TableCell>
                      
                        <Chip
                          label={caseItem.status}
                          color={getStatusColor(caseItem.status) }
                          size="small"
                        />
                      </TableCell>
                      {caseItem.assignedOfficer || 'Unassigned'}</TableCell>
                      
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </TableCell>
                      
                        <PrimaryButton size="small" variant="outlined">
                          View
                        </PrimaryButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* System Settings Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System configuration and maintenance options will be implemented here.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        
          {selectedUser ? 'Edit User' : 'Create User'}
        </DialogTitle>
        
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  fullWidth
                  disabled={!!selectedUser}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Role"
                  select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="GENERAL_USER">General User
                  <MenuItem value="LAW_ENFORCEMENT">Law Enforcement
                  <MenuItem value="ADMINISTRATOR">Administrator
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
          <PrimaryButton onClick={() => setUserDialogOpen(false)}>Cancel
          <PrimaryButton onClick={handleSaveUser} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;

export default AdminPage;
, ' as People ,
  Assignment ,
  TrendingUp ,
  Security ,
  Add ,
  Edit ,
  Delete ,
'
import { adminAPI, casesAPI, usersAPI } from '../../services/api';







const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // User management dialog
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const [usersResponse, casesResponse, statsResponse] = await Promise.all([
        adminAPI.getUsers(),
        casesAPI.getCases(),
        usersAPI.getUserStats(),
      ]);

      setUsers(usersResponse.data);
      setCases(casesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setAlert({ type: 'error', message: 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserFormData({
    setUserDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        await adminAPI.updateUser(selectedUser._id, userFormData);
        setAlert({ type: 'success', message: 'User updated successfully!' });
      } else {
        // Note: This would need a create user endpoint
        setAlert({ type: 'error', message: 'User creation not implemented yet.' });
        return;
      setUserDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to save user:', error);
      setAlert({
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Note: This would need a delete user endpoint
        setAlert({ type: 'error', message: 'User deletion not implemented yet.' });
      } catch (error) {
        console.error('Failed to delete user:', error);
        setAlert({ type: 'error', message: 'Failed to delete user.' });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'error';
      case 'LAW_ENFORCEMENT':
        return 'warning';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'open':
        return 'success';
      case 'resolved':
      case 'closed':
        return 'default';
      case 'pending':
        return 'warning';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Total Users
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalUsers}
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Total Cases
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalCases}
                      </Typography>
                    </Box>
                    <AssignmentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Active Cases
                      </Typography>
                      <Typography variant="h4">
                        {stats.activeCases}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                      <Typography variant="h6" color="text.secondary">
                        Resolved Cases
                      </Typography>
                      <Typography variant="h4">
                        {stats.resolvedCases}
                      </Typography>
                    </Box>
                    <SecurityIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Users" />
            <Tab label="Cases" />
            <Tab label="System Settings" />
          </Tabs>
        </Paper>

        {/* Users Tab */}
        {activeTab === 0 && (
          
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">User Management
              <PrimaryButton variant="contained" startIcon={<AddIcon />} onClick={handleCreateUser}>
                Add User
              </PrimaryButton>
            </Box>
            Name
                    Email
                    Role
                    Status
                    Created
                    Actions
                  </TableRow>
                </TableHead>
                
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      
                        {user.firstName} {user.lastName}
                      </TableCell>
                      {user.email}</TableCell>
                      
                        <Chip
                          label={user.role.replace('_', ' ')}
                          color={getRoleColor(user.role) }
                          size="small"
                        />
                      </TableCell>
                      
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      
                        <PrimaryButton
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </PrimaryButton>
                        <PrimaryButton
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteUser(user._id)}
                          sx={{ ml: 1 }}
                        >
                          Delete
                        </PrimaryButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Cases Tab */}
        {activeTab === 1 && (
          
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Case Management
            </Box>
            Title
                    Status
                    Assigned Officer
                    Created
                    Actions
                  </TableRow>
                </TableHead>
                
                  {cases.slice(0, 20).map((caseItem) => (
                    <TableRow key={caseItem._id}>
                      {caseItem.title}</TableCell>
                      
                        <Chip
                          label={caseItem.status}
                          color={getStatusColor(caseItem.status) }
                          size="small"
                        />
                      </TableCell>
                      {caseItem.assignedOfficer || 'Unassigned'}</TableCell>
                      
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </TableCell>
                      
                        <PrimaryButton size="small" variant="outlined">
                          View
                        </PrimaryButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* System Settings Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System configuration and maintenance options will be implemented here.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        
          {selectedUser ? 'Edit User' : 'Create User'}
        </DialogTitle>
        
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  fullWidth
                  disabled={!!selectedUser}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Role"
                  select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="GENERAL_USER">General User
                  <MenuItem value="LAW_ENFORCEMENT">Law Enforcement
                  <MenuItem value="ADMINISTRATOR">Administrator
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
          <PrimaryButton onClick={() => setUserDialogOpen(false)}>Cancel
          <PrimaryButton onClick={handleSaveUser} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;

export default AdminPage;

