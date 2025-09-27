import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

import AdvancedSearchForm from '../components/Search/AdvancedSearchForm';
import SavedSearches from '../components/Search/SavedSearches';
import CaseList from '../components/Cases/CaseList';
import { casesAPI } from '../services/api';
import PrimaryButton from '../components/Common/PrimaryButton';

const mockSavedSearches = [
  {
    id: 'recent-activity',
    name: 'Recent Activity in Mumbai',
    createdAt: new Date().toISOString(),
    filters: {
      city: 'Mumbai',
      status: 'open',
      lastSeenWithinDays: 14,
    },
    isFavorite: true,
  },
  {
    id: 'northern-region',
    name: 'Northern Region Victims',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    filters: {
      region: 'north',
      gender: 'female',
    },
    isFavorite: false,
  },
];

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState(mockSavedSearches);

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const response = await casesAPI.searchCases(filters);
      setSearchResults(response.data);
      setActiveTab(2);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = (filters, name) => {
    const newSearch = {
      id: `saved-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      filters,
      isFavorite: false,
    };
    setSavedSearches((prev) => [newSearch, ...prev]);
  };

  const handleLoadSearch = (filters) => {
    setActiveTab(0);
    // The search form listens to this event via props
    // We let AdvancedSearchForm handle applying the filters
  };

  const handleDeleteSearch = (searchId) => {
    setSavedSearches((prev) => prev.filter((search) => search.id !== searchId));
  };

  const handleToggleFavorite = (searchId) => {
    setSavedSearches((prev) =>
      prev.map((search) =>
        search.id === searchId ? { ...search, isFavorite: !search.isFavorite } : search
      )
    );
  };

  const handleShareSearch = (searchId) => {
    const search = savedSearches.find((item) => item.id === searchId);
    if (!search) return;

    const sharePayload = {
      name: search.name,
      filters: search.filters,
    };

    navigator.clipboard
      .writeText(JSON.stringify(sharePayload, null, 2))
      .then(() => {
        alert('Saved search details copied to clipboard.');
      })
      .catch(() => {
        console.log('Share payload:', sharePayload);
      });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Advanced Search
        </Typography>

        <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" allowScrollButtonsMobile>
            <Tab icon={<SearchIcon />} iconPosition="start" label="Search" />
            <Tab icon={<BookmarkIcon />} iconPosition="start" label="Saved Searches" />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="Results" />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {activeTab === 0 && (
            <Grid item xs={12}>
              <AdvancedSearchForm onSearch={handleSearch} onSaveSearch={handleSaveSearch} loading={loading} />
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid item xs={12}>
              <SavedSearches
                searches={savedSearches}
                onLoadSearch={handleLoadSearch}
                onDeleteSearch={handleDeleteSearch}
                onToggleFavorite={handleToggleFavorite}
                onShareSearch={handleShareSearch}
              />
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid item xs={12}>
              {searchResults ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Search Results ({searchResults.total} cases found)
                    </Typography>
                    <PrimaryButton variant="outlined" startIcon={<SearchIcon />} onClick={() => setActiveTab(0)}>
                      New Search
                    </PrimaryButton>
                  </Box>

                  <CaseList
                    cases={searchResults.cases}
                    loading={false}
                    onEdit={(caseItem) => console.log('Edit case:', caseItem)}
                    onDelete={(caseId) => console.log('Delete case:', caseId)}
                    onRefresh={() => handleSearch(searchResults.appliedFilters)}
                  />
                </>
              ) : (
                <Alert severity="info">No search results yet. Use the search tab to find cases.</Alert>
              )}
            </Grid>
          )}
        </Grid>
      </Box>

      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Searching cases...
          </Typography>
        </Box>
      </Backdrop>
    </Container>
  );
};

export default SearchPage;

