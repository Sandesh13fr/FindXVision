import React from 'react';
import  { Container, Box, Typography, Grid, Paper, Tabs, Tab, Card, CardContent }  from '@mui/material';

        import PrimaryButton from '../components/Common/PrimaryButton';
);

  const [trends, setTrends] = useState({
  const [users, setUsers] = useState([
    {
  const handleTabChange = (event: React.SyntheticEvent, newValue) => {
    setActiveTab(newValue);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // In real app, fetch fresh data from API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
  };

  const handleUserEdit = (user) => {
    console.log('Edit user:', user);
    // Implementation for user editing
  };

  const handleUserDelete = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    console.log('Delete user:', userId);
  };

  const handleUserSuspend = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'SUSPENDED' } ));
    console.log('Suspend user:', userId);
  };

  const handleUserActivate = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'ACTIVE' } ));
    console.log('Activate user:', userId);
  };

  const handleUserCreate = () => {
    console.log('Create new user');
    // Implementation for user creation
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          <PrimaryButton
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={loading}
          >
            Refresh Data
          </PrimaryButton>
        </Box>

        <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<AssessmentIcon />} label="Analytics" />
            <Tab icon={<PeopleIcon />} label="User Management" />
            <Tab icon={<SettingsIcon />} label="System Settings" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          
            <AnalyticsOverview data={analyticsData} trends={trends} />
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <PrimaryButton variant="outlined" fullWidth>
                        Generate System Report
                      </PrimaryButton>
                      <PrimaryButton variant="outlined" fullWidth>
                        Export User Data
                      </PrimaryButton>
                      <PrimaryButton variant="outlined" fullWidth>
                        Backup Database
                      </PrimaryButton>
                      <PrimaryButton variant="outlined" fullWidth>
                        View System Logs
                      </PrimaryButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                
                    <Typography variant="h6" gutterBottom>
                      System Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Database
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Email Service
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">WhatsApp API
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">File Storage
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Monitoring
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          
            <AnalyticsOverview data={analyticsData} trends={trends} />
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Detailed Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced analytics charts and reports would be displayed here.
            </Typography>
          </Box>
        )}

        {activeTab === 2 && (
          <UserManagement
            users={users}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
            onUserSuspend={handleUserSuspend}
            onUserActivate={handleUserActivate}
            onUserCreate={handleUserCreate}
            loading={loading}
          />
        )}

        {activeTab === 3 && (
          
              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                System configuration and settings would be displayed here.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard;
, ' as Dashboard ,
  People ,
  Assessment ,
  Settings ,
  Refresh ,
'
import AnalyticsOverview from '../components/Admin/AnalyticsOverview';
import UserManagement from '../components/Admin/UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Mock data - in real app this would come from API
  const [analyticsData, setAnalyticsData] = useState({
  const [trends, setTrends] = useState({
  const [users, setUsers] = useState([
    {
  const handleTabChange = (event: React.SyntheticEvent, newValue) => {
    setActiveTab(newValue);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // In real app, fetch fresh data from API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
  };

  const handleUserEdit = (user) => {
    console.log('Edit user:', user);
    // Implementation for user editing
  };

  const handleUserDelete = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    console.log('Delete user:', userId);
  };

  const handleUserSuspend = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'SUSPENDED' } ));
    console.log('Suspend user:', userId);
  };

  const handleUserActivate = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'ACTIVE' } ));
    console.log('Activate user:', userId);
  };

  const handleUserCreate = () => {
    console.log('Create new user');
    // Implementation for user creation
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          <PrimaryButton
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={loading}
          >
            Refresh Data
          </PrimaryButton>
        </Box>

        <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<AssessmentIcon />} label="Analytics" />
            <Tab icon={<PeopleIcon />} label="User Management" />
            <Tab icon={<SettingsIcon />} label="System Settings" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          
            <AnalyticsOverview data={analyticsData} trends={trends} />
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <PrimaryButton variant="outlined" fullWidth>
                        Generate System Report
                      </PrimaryButton>
                      <PrimaryButton variant="outlined" fullWidth>
                        Export User Data
                      </PrimaryButton>
                      <PrimaryButton variant="outlined" fullWidth>
                        Backup Database
                      </PrimaryButton>
                      <PrimaryButton variant="outlined" fullWidth>
                        View System Logs
                      </PrimaryButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                
                    <Typography variant="h6" gutterBottom>
                      System Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Database
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Email Service
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">WhatsApp API
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">File Storage
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Monitoring
                        <Typography variant="body2" color="success.main">Online
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          
            <AnalyticsOverview data={analyticsData} trends={trends} />
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Detailed Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced analytics charts and reports would be displayed here.
            </Typography>
          </Box>
        )}

        {activeTab === 2 && (
          <UserManagement
            users={users}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
            onUserSuspend={handleUserSuspend}
            onUserActivate={handleUserActivate}
            onUserCreate={handleUserCreate}
            loading={loading}
          />
        )}

        {activeTab === 3 && (
          
              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                System configuration and settings would be displayed here.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard;

