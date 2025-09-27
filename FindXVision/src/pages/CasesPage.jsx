import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import CaseForm from '../components/Cases/CaseForm';
import CaseList from '../components/Cases/CaseList';
import { casesAPI } from '../services/api';
import PrimaryButton from '../components/Common/PrimaryButton';

const CasesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const { data } = await casesAPI.getCases();
      setCases(data);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (caseData) => {
    try {
      await casesAPI.createCase(caseData);
      setCreateDialogOpen(false);
      await loadCases();
    } catch (error) {
      console.error('Failed to create case:', error);
      throw error;
    }
  };

  const handleEditCase = async (caseData) => {
    if (!selectedCase) return;

    try {
      await casesAPI.updateCase(selectedCase._id, caseData);
      setEditDialogOpen(false);
      setSelectedCase(null);
      await loadCases();
    } catch (error) {
      console.error('Failed to update case:', error);
      throw error;
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (!window.confirm('Are you sure you want to delete this case?')) {
      return;
    }

    try {
      await casesAPI.deleteCase(caseId);
      await loadCases();
    } catch (error) {
      console.error('Failed to delete case:', error);
    }
  };

  const openEditDialog = (caseItem) => {
    setSelectedCase(caseItem);
    setEditDialogOpen(true);
  };

  const fabVisible = useMemo(() => cases.length > 0, [cases.length]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Case Management
          </Typography>
          <PrimaryButton startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)} size="large">
            Create New Case
          </PrimaryButton>
        </Box>

        <CaseList
          cases={cases}
          loading={loading}
          onEdit={openEditDialog}
          onDelete={handleDeleteCase}
          onRefresh={loadCases}
        />

        {fabVisible && (
          <Fab
            color="primary"
            aria-label="add case"
            onClick={() => setCreateDialogOpen(true)}
            sx={{ position: 'fixed', bottom: 32, right: 32 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Case</DialogTitle>
        <DialogContent dividers>
          <CaseForm
            initialData={{}}
            onSubmit={handleCreateCase}
            onCancel={() => setCreateDialogOpen(false)}
            submitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Case</DialogTitle>
        <DialogContent dividers>
          {selectedCase && (
            <CaseForm
              initialData={selectedCase}
              onSubmit={handleEditCase}
              onCancel={() => setEditDialogOpen(false)}
              isEditing
              submitting={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CasesPage;

