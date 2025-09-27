import React from 'react';
import  { Container, Typography, Paper, Box, Grid, Card, CardContent, Chip, Alert, CircularProgress, Tabs, Tab, Avatar, List, ListItem, ListItemText, ListItemAvatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem }  from '@mui/material';import { useNavigate, useLocation } from 'react-router-dom';
import { casesAPI } from '../../services/api';
  import PrimaryButton from '../../components/Common/PrimaryButton';
};
    lastName;
    age;
    gender;
    description;
    lastSeenDate;
    lastSeenLocation;
  };
    lastName;
    email;
    phone;
    relationship;
  };
  assignedOfficer?: {
    _id;
    firstName;
    lastName;
    email;
  };
const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
  useEffect(() => {
    if (id) {
      loadCaseDetails();
  }, [id]);

  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getCaseById(id!);
      setCaseData(response.data);
      setEditForm({
    } catch (error) {
      console.error('Failed to load case details:', error);
      setAlert({
    } finally {
      setLoading(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditCase = async () => {
    try {
      await casesAPI.updateCase(id!, editForm);
      setAlert({ type: 'success', message: 'Case updated successfully!' });
      setEditDialogOpen(false);
      loadCaseDetails();
    } catch (error) {
      console.error('Failed to update case:', error);
      setAlert({
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'resolved':
      case 'closed':
        return 'default';
      case 'cancelled':
        return 'error';
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  if (!caseData) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Case not found or failed to load.
        </Alert>
      </Container>
    );
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Case Details
          </Typography>
          <PrimaryButton
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit Case
          </PrimaryButton>
        </Box>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        {/* Case Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {caseData.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {caseData.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={caseData.status}
                  color={getStatusColor(caseData.status) }
                />
                <Chip
                  label={caseData.priority}
                  color={getPriorityColor(caseData.priority) }
                />
                <Chip label={caseData.category} variant="outlined" />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(caseData.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(caseData.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {caseData.assignedOfficer && (
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  
                    <Typography variant="body2" color="text.secondary">
                      Assigned Officer
                    </Typography>
                    <Typography variant="body2">
                      {caseData.assignedOfficer.firstName} {caseData.assignedOfficer.lastName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Missing Person" />
            <Tab label="Location & Reporter" />
            <Tab label="Attachments" />
            <Tab label="Notes" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                Missing Person Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Name
                  <Typography variant="body1">
                    {caseData.missingPerson.firstName} {caseData.missingPerson.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Age
                  <Typography variant="body1">{caseData.missingPerson.age} years old
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Gender
                  <Typography variant="body1">{caseData.missingPerson.gender}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Physical Description
                  <Typography variant="body1">{caseData.missingPerson.description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Last Seen Date
                  <Typography variant="body1">
                    {new Date(caseData.missingPerson.lastSeenDate).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Last Seen Location
                  <Typography variant="body1">{caseData.missingPerson.lastSeenLocation}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    Location Information
                  </Typography>
                  <Typography variant="body1">
                    {caseData.location.address}<br />
                    {caseData.location.city}, {caseData.location.state} {caseData.location.zipCode}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Reporter Information
                  </Typography>
                  <Typography variant="body1">
                    {caseData.reporter.firstName} {caseData.reporter.lastName}</strong><br />
};

export default CaseDetailPage;
, ' as Edit ,
  LocationOn ,
  Person ,
  Phone ,
  Email ,
  AccessTime ,
  Description ,
  AttachFile ,
'
import { useParams, useNavigate }import { useNavigate, useLocation } from 'react-router-dom';
import { casesAPI } from '../../services/api';
  };
    lastName;
    age;
    gender;
    description;
    lastSeenDate;
    lastSeenLocation;
  };
    lastName;
    email;
    phone;
    relationship;
  };
  assignedOfficer?: {
    _id;
    firstName;
    lastName;
    email;
  };
const CaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
  useEffect(() => {
    if (id) {
      loadCaseDetails();
  }, [id]);

  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getCaseById(id!);
      setCaseData(response.data);
      setEditForm({
    } catch (error) {
      console.error('Failed to load case details:', error);
      setAlert({
    } finally {
      setLoading(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditCase = async () => {
    try {
      await casesAPI.updateCase(id!, editForm);
      setAlert({ type: 'success', message: 'Case updated successfully!' });
      setEditDialogOpen(false);
      loadCaseDetails();
    } catch (error) {
      console.error('Failed to update case:', error);
      setAlert({
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'resolved':
      case 'closed':
        return 'default';
      case 'cancelled':
        return 'error';
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  if (!caseData) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Case not found or failed to load.
        </Alert>
      </Container>
    );
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Case Details
          </Typography>
          <PrimaryButton
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit Case
          </PrimaryButton>
        </Box>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        {/* Case Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {caseData.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {caseData.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={caseData.status}
                  color={getStatusColor(caseData.status) }
                />
                <Chip
                  label={caseData.priority}
                  color={getPriorityColor(caseData.priority) }
                />
                <Chip label={caseData.category} variant="outlined" />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(caseData.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(caseData.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {caseData.assignedOfficer && (
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  
                    <Typography variant="body2" color="text.secondary">
                      Assigned Officer
                    </Typography>
                    <Typography variant="body2">
                      {caseData.assignedOfficer.firstName} {caseData.assignedOfficer.lastName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Missing Person" />
            <Tab label="Location & Reporter" />
            <Tab label="Attachments" />
            <Tab label="Notes" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                Missing Person Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Name
                  <Typography variant="body1">
                    {caseData.missingPerson.firstName} {caseData.missingPerson.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Age
                  <Typography variant="body1">{caseData.missingPerson.age} years old
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Gender
                  <Typography variant="body1">{caseData.missingPerson.gender}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Physical Description
                  <Typography variant="body1">{caseData.missingPerson.description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Last Seen Date
                  <Typography variant="body1">
                    {new Date(caseData.missingPerson.lastSeenDate).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Last Seen Location
                  <Typography variant="body1">{caseData.missingPerson.lastSeenLocation}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    Location Information
                  </Typography>
                  <Typography variant="body1">
                    {caseData.location.address}<br />
                    {caseData.location.city}, {caseData.location.state} {caseData.location.zipCode}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Reporter Information
                  </Typography>
                  <Typography variant="body1">
                    {caseData.reporter.firstName} {caseData.reporter.lastName}</strong><br />
};

export default CaseDetailPage;

