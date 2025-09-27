import React from 'react';
import  { Container, Typography, Paper, Box, Avatar, TextField, Grid, Card, CardContent, Divider, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions }  from '@mui/material';

         import PrimaryButton from '../../components/Common/PrimaryButton';
from 'react-redux';
import { RootState } from '../../store/store';
import { authAPI, usersAPI } from '../../services/api';



const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
  const [editData, setEditData] = useState({
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfile(response.data);
      setEditData({
    } catch (error) {
      console.error('Failed to load profile:', error);
      setAlert({ type: 'error', message: 'Failed to load profile information.' });
    } finally {
      setLoading(false);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setAlert(null);

      await usersAPI.updateProfile(editData);
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      setEditing(false);
      loadProfile(); // Reload profile data
    } catch (error) {
      console.error('Failed to update profile:', error);
      setAlert({
    } finally {
      setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match.' });
      return;
    try {
      setSaving(true);
      setAlert(null);

      await usersAPI.changePassword({
      setAlert({ type: 'success', message: 'Password changed successfully!' });
      setChangePasswordOpen(false);
      setPasswordData({
    } catch (error) {
      console.error('Failed to change password:', error);
      setAlert({
    } finally {
      setSaving(false);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditData({
    setEditing(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  if (!profile) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load profile information.
        </Alert>
      </Container>
    );
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            
                <Box display="flex" alignItems="center" gap={3}>
                  <Avatar
                    sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                  >
                    <PersonIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  
                    <Typography variant="h5">
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {profile.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
};

export default ProfilePage;

export default ProfilePage;
, ' as Edit ,
  Save ,
  Cancel ,
  Person ,
  Email ,
  Phone ,
  LocationOn ,
  Security ,
'
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { authAPI, usersAPI } from '../../services/api';



const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
  const [editData, setEditData] = useState({
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setProfile(response.data);
      setEditData({
    } catch (error) {
      console.error('Failed to load profile:', error);
      setAlert({ type: 'error', message: 'Failed to load profile information.' });
    } finally {
      setLoading(false);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setAlert(null);

      await usersAPI.updateProfile(editData);
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      setEditing(false);
      loadProfile(); // Reload profile data
    } catch (error) {
      console.error('Failed to update profile:', error);
      setAlert({
    } finally {
      setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match.' });
      return;
    try {
      setSaving(true);
      setAlert(null);

      await usersAPI.changePassword({
      setAlert({ type: 'success', message: 'Password changed successfully!' });
      setChangePasswordOpen(false);
      setPasswordData({
    } catch (error) {
      console.error('Failed to change password:', error);
      setAlert({
    } finally {
      setSaving(false);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditData({
    setEditing(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  if (!profile) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load profile information.
        </Alert>
      </Container>
    );
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            
                <Box display="flex" alignItems="center" gap={3}>
                  <Avatar
                    sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                  >
                    <PersonIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  
                    <Typography variant="h5">
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {profile.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
};

export default ProfilePage;

export default ProfilePage;

