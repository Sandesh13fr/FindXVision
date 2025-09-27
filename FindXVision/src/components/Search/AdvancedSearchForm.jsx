import React from 'react';
import  { Box, Card, CardContent, Typography, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Collapse, Divider, Accordion, AccordionSummary, AccordionDetails }  from '@mui/material';

         import PrimaryButton from '../Common/PrimaryButton';
from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
  gender;
    to;
  };
    state;
    radius;
  };
  caseType;
  assignedTo;
  tags;
const AdvancedSearchForm = ({
  onSearch,
  onSaveSearch,
  initialFilters = {},
  loading = false,
}) => {
  const [filters, setFilters] = useState({
  const [expanded, setExpanded] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedFilterChange = (
    parentField,
    childField,
    value) => {
    setFilters(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] ),
        [childField],
      },
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    const currentValues = filters[field] ;
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    handleFilterChange(field, newValues);
  };

  const addTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      handleFilterChange('tags', [...filters.tags, newTag.trim()]);
      setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    handleFilterChange('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const clearFilters = () => {
    setFilters({
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const hasActiveFilters = () => {
    return (
      filters.query.trim() !== '' ||
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.ageRange.min !== null ||
      filters.ageRange.max !== null ||
      filters.gender !== '' ||
      filters.dateRange.from !== null ||
      filters.dateRange.to !== null ||
      filters.location.city !== '' ||
      filters.location.state !== '' ||
      filters.caseType !== '' ||
      filters.assignedTo !== '' ||
      filters.tags.length > 0
    );
  };

  return (
    
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Search & Filter Cases
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PrimaryButton
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setExpanded(!expanded)}
            >
              Advanced Filters
            </PrimaryButton>
            {hasActiveFilters() && (
              <PrimaryButton
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Clear All
              </PrimaryButton>
            )}
          </Box>
        </Box>

        {/* Basic Search */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, case number, description..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            InputProps={{
              if (name) onSaveSearch(filters, name);
            }}
            disabled={!hasActiveFilters()}
          >
            Save Search
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            Search Cases
          </PrimaryButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchForm;
, ' as Search ,
  Clear ,
  ExpandMore ,
  FilterList ,
  Save ,
'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
  gender;
    to;
  };
    state;
    radius;
  };
  caseType;
  assignedTo;
  tags;
const AdvancedSearchForm = ({
  onSearch,
  onSaveSearch,
  initialFilters = {},
  loading = false,
}) => {
  const [filters, setFilters] = useState({
  const [expanded, setExpanded] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedFilterChange = (
    parentField,
    childField,
    value) => {
    setFilters(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] ),
        [childField],
      },
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    const currentValues = filters[field] ;
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    handleFilterChange(field, newValues);
  };

  const addTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      handleFilterChange('tags', [...filters.tags, newTag.trim()]);
      setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    handleFilterChange('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const clearFilters = () => {
    setFilters({
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const hasActiveFilters = () => {
    return (
      filters.query.trim() !== '' ||
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.ageRange.min !== null ||
      filters.ageRange.max !== null ||
      filters.gender !== '' ||
      filters.dateRange.from !== null ||
      filters.dateRange.to !== null ||
      filters.location.city !== '' ||
      filters.location.state !== '' ||
      filters.caseType !== '' ||
      filters.assignedTo !== '' ||
      filters.tags.length > 0
    );
  };

  return (
    
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Search & Filter Cases
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PrimaryButton
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setExpanded(!expanded)}
            >
              Advanced Filters
            </PrimaryButton>
            {hasActiveFilters() && (
              <PrimaryButton
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Clear All
              </PrimaryButton>
            )}
          </Box>
        </Box>

        {/* Basic Search */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, case number, description..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            InputProps={{
              if (name) onSaveSearch(filters, name);
            }}
            disabled={!hasActiveFilters()}
          >
            Save Search
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            Search Cases
          </PrimaryButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchForm;

