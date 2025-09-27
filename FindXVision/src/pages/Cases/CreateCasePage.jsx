import React from 'react';
import  { Container, Typography, Paper, Box, Grid, TextField, Alert, CircularProgress, Stepper, Step, StepLabel, Card, CardContent, MenuItem, FormControl, InputLabel, Select, Chip }  from '@mui/material';
import { useNavigate }import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller }import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  attachments;
const steps = ['Basic Information', 'Missing Person Details', 'Location & Reporter', 'Review & Submit'];

const CreateCasePage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileChange = (event: React.ChangeEvent) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setAlert(null);

      // Create FormData for file uploads
      const formData = new FormData();

      // Add basic case data
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      formData.append('category', data.category);

      // Add location data
      formData.append('location', JSON.stringify(data.location));

      // Add missing person data
      formData.append('missingPerson', JSON.stringify(data.missingPerson));

      // Add reporter data
      formData.append('reporter', JSON.stringify(data.reporter));

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await casesAPI.createCase(formData);

      setAlert({ type: 'success', message: 'Case created successfully!' });

      // Navigate to the case detail page
      setTimeout(() => {
        navigate(`/cases/${response.data._id}`);
      }, 2000);

    } catch (error) {
      console.error('Failed to create case:', error);
      setAlert({
    } finally {
      setLoading(false);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Case Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Case Description"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  Priority
                    <Select {...field} label="Priority">
                      <MenuItem value="LOW">Low
                      <MenuItem value="MEDIUM">Medium
                      <MenuItem value="HIGH">High
                      <MenuItem value="CRITICAL">Critical
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  Category
                    <Select {...field} label="Category">
                      <MenuItem value="MISSING_PERSON">Missing Person
                      <MenuItem value="RUNAWAY">Runaway
                      <MenuItem value="ABDUCTION">Abduction
                      <MenuItem value="OTHER">Other
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="missingPerson.firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.missingPerson?.firstName}
                    helperText={errors.missingPerson?.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="missingPerson.lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.missingPerson?.lastName}
                    helperText={errors.missingPerson?.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="missingPerson.age"
                control={control}
                rules={{ required: 'Age is required', min: { value: 0, message: 'Age must be positive' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Age"
                    type="number"
                    fullWidth
                    error={!!errors.missingPerson?.age}
                    helperText={errors.missingPerson?.age?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="missingPerson.gender"
                control={control}
                rules={{ required: 'Gender is required' }}
                render={({ field }) => (
                  Gender
                    <Select {...field} label="Gender">
                      <MenuItem value="MALE">Male
                      <MenuItem value="FEMALE">Female
                      <MenuItem value="OTHER">Other
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="missingPerson.description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Physical Description"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Height, weight, hair color, eye color, distinctive features..."
                    error={!!errors.missingPerson?.description}
                    helperText={errors.missingPerson?.description?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="missingPerson.lastSeenDate"
                control={control}
                rules={{ required: 'Last seen date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Seen Date"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.missingPerson?.lastSeenDate}
                    helperText={errors.missingPerson?.lastSeenDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="missingPerson.lastSeenLocation"
                control={control}
                rules={{ required: 'Last seen location is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Seen Location"
                    fullWidth
                    error={!!errors.missingPerson?.lastSeenLocation}
                    helperText={errors.missingPerson?.lastSeenLocation?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="location.address"
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Street Address"
                    fullWidth
                    error={!!errors.location?.address}
                    helperText={errors.location?.address?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="location.city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={!!errors.location?.city}
                    helperText={errors.location?.city?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name="location.state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    error={!!errors.location?.state}
                    helperText={errors.location?.state?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name="location.zipCode"
                control={control}
                rules={{ required: 'ZIP code is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ZIP Code"
                    fullWidth
                    error={!!errors.location?.zipCode}
                    helperText={errors.location?.zipCode?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Reporter Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="reporter.firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.reporter?.firstName}
                    helperText={errors.reporter?.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="reporter.lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.reporter?.lastName}
                    helperText={errors.reporter?.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="reporter.email"
                control={control}
                rules={{
      case 3= watch();
        return (
          
            <Typography variant="h6" gutterBottom>
              Review Case Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                
                    <Typography variant="h6" color="primary">Basic Information
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Case
        </Typography>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                {label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <PrimaryButton
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </PrimaryButton>
              <Box sx={{ flex: '1 1 auto' }} />

              {activeStep === steps.length - 1 ? (
                <PrimaryButton
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating Case...' : 'Create Case'}
                </PrimaryButton>
              ) : (
                <PrimaryButton variant="contained" onClick={handleNext}>
                  Next
                </PrimaryButton>
              )}
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateCasePage;

