import React from 'react';
import { useNavigate }import { useNavigate, useLocation } from 'react-router-dom';
import  { Box, Container, Typography, Fab, Dialog, DialogTitle, DialogContent, DialogActions }  from '@mui/material';

         import PrimaryButton from '../../components/Common/PrimaryButton';
from '../../services/api';
  createdAt;
  updatedAt;
const CasesPage = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      // Simulated API call for now
      setCases([]);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
  };

  const handleCreateCase = async (caseData) => {
    try {
      await casesAPI.createCase(caseData);
      setShowCreateDialog(false);
      loadCases(); // Reload cases
    } catch (error) {
      console.error('Failed to create case:', error);
      throw error;
  };

  const handleEditCase = async (caseData) => {
    if (!selectedCase) return;
    
    try {
      await casesAPI.updateCase(selectedCase._id, caseData);
      setShowEditDialog(false);
      setSelectedCase(null);
      loadCases(); // Reload cases
    } catch (error) {
      console.error('Failed to update case:', error);
      throw error;
  };

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await casesAPI.deleteCase(caseId);
        loadCases(); // Reload cases
      } catch (error) {
        console.error('Failed to delete case:', error);
        throw error;
  };

  const openEditDialog = (caseItem) => {
    setSelectedCase(caseItem);
    setShowEditDialog(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Case Management
          </Typography>
          <PrimaryButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            size="large"
          >
            Create New Case
          </PrimaryButton>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Case list will be displayed here once the backend API is connected.
        </Typography>

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          aria-label="add case"
          sx={{
                navigate('/cases/create');
              }}
            >
              Proceed to Create Case
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Edit Case Dialog */}
        <Dialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          Edit Case
          
            <Typography variant="body1" gutterBottom>
              You will be redirected to the case details page where you can edit the case information.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can modify case status, priority, and other details from the case details view.
            </Typography>
          </DialogContent>
          
            <PrimaryButton onClick={() => setShowEditDialog(false)}>Cancel
            <PrimaryButton
              variant="contained"
              onClick={() => {
                setShowEditDialog(false);
                if (selectedCase) {
                  navigate(`/cases/${selectedCase._id}`);
              }}
            >
              Proceed to Edit Case
            </PrimaryButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CasesPage;
, ' as Add ,
'
import CaseForm from '../../components/Cases/CaseForm';
import CaseList from '../../components/Cases/CaseList';
import { casesAPI } from '../../services/api';
  createdAt;
  updatedAt;
const CasesPage = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      // Simulated API call for now
      setCases([]);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
  };

  const handleCreateCase = async (caseData) => {
    try {
      await casesAPI.createCase(caseData);
      setShowCreateDialog(false);
      loadCases(); // Reload cases
    } catch (error) {
      console.error('Failed to create case:', error);
      throw error;
  };

  const handleEditCase = async (caseData) => {
    if (!selectedCase) return;
    
    try {
      await casesAPI.updateCase(selectedCase._id, caseData);
      setShowEditDialog(false);
      setSelectedCase(null);
      loadCases(); // Reload cases
    } catch (error) {
      console.error('Failed to update case:', error);
      throw error;
  };

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await casesAPI.deleteCase(caseId);
        loadCases(); // Reload cases
      } catch (error) {
        console.error('Failed to delete case:', error);
        throw error;
  };

  const openEditDialog = (caseItem) => {
    setSelectedCase(caseItem);
    setShowEditDialog(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Case Management
          </Typography>
          <PrimaryButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            size="large"
          >
            Create New Case
          </PrimaryButton>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Case list will be displayed here once the backend API is connected.
        </Typography>

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          aria-label="add case"
          sx={{
                navigate('/cases/create');
              }}
            >
              Proceed to Create Case
            </PrimaryButton>
          </DialogActions>
        </Dialog>

        {/* Edit Case Dialog */}
        <Dialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          Edit Case
          
            <Typography variant="body1" gutterBottom>
              You will be redirected to the case details page where you can edit the case information.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can modify case status, priority, and other details from the case details view.
            </Typography>
          </DialogContent>
          
            <PrimaryButton onClick={() => setShowEditDialog(false)}>Cancel
            <PrimaryButton
              variant="contained"
              onClick={() => {
                setShowEditDialog(false);
                if (selectedCase) {
                  navigate(`/cases/${selectedCase._id}`);
              }}
            >
              Proceed to Edit Case
            </PrimaryButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CasesPage;

