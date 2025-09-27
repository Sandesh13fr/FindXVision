import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

import PrimaryButton from '../Common/PrimaryButton';

const emptyStakeholder = {
  name: '',
  relationship: '',
  phoneNumber: '',
  email: '',
  address: '',
};

const StakeholdersTab = ({ formData, updateFormData }) => {
  const stakeholders = formData.stakeholders || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyStakeholder);

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStakeholder = () => {
    if (!draft.name || !draft.relationship || !draft.phoneNumber) {
      return;
    }

    updateFormData({ stakeholders: [...stakeholders, draft] });
    setDraft(emptyStakeholder);
    setDialogOpen(false);
  };

  const handleRemoveStakeholder = (index) => {
    updateFormData({ stakeholders: stakeholders.filter((_, i) => i !== index) });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Stakeholders</Typography>
        <PrimaryButton variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Stakeholder
        </PrimaryButton>
      </Box>

      {stakeholders.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No stakeholders added yet. Click “Add Stakeholder” to get started.
        </Typography>
      )}

      {stakeholders.map((stakeholder, index) => (
        <Card key={`${stakeholder.name}-${index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {stakeholder.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stakeholder.relationship}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Phone: {stakeholder.phoneNumber}
                </Typography>
                {stakeholder.email && (
                  <Typography variant="body2">Email: {stakeholder.email}</Typography>
                )}
                {stakeholder.address && (
                  <Typography variant="body2">Address: {stakeholder.address}</Typography>
                )}
              </Box>
              <IconButton color="error" onClick={() => handleRemoveStakeholder(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Stakeholder</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={draft.name}
                onChange={(event) => handleDraftChange('name', event.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relationship"
                value={draft.relationship}
                onChange={(event) => handleDraftChange('relationship', event.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={draft.phoneNumber}
                onChange={(event) => handleDraftChange('phoneNumber', event.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={draft.email}
                onChange={(event) => handleDraftChange('email', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={draft.address}
                onChange={(event) => handleDraftChange('address', event.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <PrimaryButton variant="outlined" onClick={() => setDialogOpen(false)}>
            Cancel
          </PrimaryButton>
          <PrimaryButton variant="contained" onClick={handleAddStakeholder}>
            Add
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StakeholdersTab;

