import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Tabs, Tab, Alert, LinearProgress } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

import PrimaryButton from '../Common/PrimaryButton';
import BasicInfoTab from './BasicInfoTab';
import MissingPersonTab from './MissingPersonTab';
import LocationTab from './LocationTab';
import StakeholdersTab from './StakeholdersTab';
import AttachmentsTab from './AttachmentsTab';

const defaultCase = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  policeReportNumber: '',
  circumstances: '',
  missingPerson: {
    firstName: '',
    lastName: '',
    age: '',
    gender: 'unknown',
    lastKnownClothing: '',
  },
  lastSeenLocation: {
    address: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
  },
  lastSeenDateTime: '',
  stakeholders: [],
  attachments: [],
};

const CaseForm = ({ initialData, onSubmit, onCancel, isEditing = false, submitting = false }) => {
  const [formData, setFormData] = useState({ ...defaultCase, ...initialData });
  const [activeTab, setActiveTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const loading = submitting || busy;

  const tabs = useMemo(
    () => [
      { label: 'Basic Info', component: BasicInfoTab },
      { label: 'Missing Person', component: MissingPersonTab },
      { label: 'Location & Time', component: LocationTab },
      { label: 'Stakeholders', component: StakeholdersTab },
      { label: 'Attachments', component: AttachmentsTab },
    ],
    []
  );

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.title.trim()) nextErrors.title = 'Title is required';
    if (!formData.description.trim()) nextErrors.description = 'Description is required';
    if (!formData.circumstances.trim()) nextErrors.circumstances = 'Describe the circumstances';
    if (!formData.missingPerson.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!formData.missingPerson.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!formData.missingPerson.age) nextErrors.age = 'Age is required';
    if (!formData.lastSeenLocation.address.trim()) nextErrors.address = 'Address is required';
    if (!formData.lastSeenLocation.city.trim()) nextErrors.city = 'City is required';
    if (!formData.lastSeenDateTime) nextErrors.lastSeenDateTime = 'Select date & time';

    setErrors(nextErrors);

    const targetTab = tabs.findIndex(({ label }) => {
      if (label === 'Basic Info' && (nextErrors.title || nextErrors.description || nextErrors.circumstances)) {
        return true;
      }
      if (label === 'Missing Person' && (nextErrors.firstName || nextErrors.lastName || nextErrors.age)) {
        return true;
      }
      if (label === 'Location & Time' && (nextErrors.address || nextErrors.city || nextErrors.lastSeenDateTime)) {
        return true;
      }
      return false;
    });

    if (targetTab >= 0) {
      setActiveTab(targetTab);
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setBusy(true);
      await onSubmit(formData);
    } finally {
      setBusy(false);
    }
  };

  const TabComponent = tabs[activeTab].component;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {isEditing ? 'Edit Case' : 'Create New Case'}
        </Typography>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please fix the highlighted fields before submitting.
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_event, value) => setActiveTab(value)} variant="scrollable" allowScrollButtonsMobile>
            {tabs.map((tab) => (
              <Tab key={tab.label} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <TabComponent formData={formData} updateFormData={updateFormData} errors={errors} setErrors={setErrors} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
          <PrimaryButton variant="outlined" onClick={onCancel} startIcon={<CancelIcon />} disabled={loading}>
            Cancel
          </PrimaryButton>
          <PrimaryButton variant="contained" onClick={handleSubmit} startIcon={<SaveIcon />} loading={loading}>
            {isEditing ? 'Update Case' : 'Create Case'}
          </PrimaryButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CaseForm;

