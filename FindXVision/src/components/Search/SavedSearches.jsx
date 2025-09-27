import React from 'react';
import  { Box, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert }  from '@mui/material';

        import PrimaryButton from '../Common/PrimaryButton';
) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [shareUrl, setShareUrl] = useState('');

  const handleShare = (search) => {
    setSelectedSearch(search);
    const encodedFilters = encodeURIComponent(JSON.stringify(search.filters));
    const url = `${window.location.origin}/search?filters=${encodedFilters}`;
    setShareUrl(url);
    setShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
  };

  const getFilterSummary = (filters) => {
    const summary = [];
    if (filters.query) summary.push(`"${filters.query}"`);
    if (filters.status?.length) summary.push(`Status: ${filters.status.join(', ')}`);
    if (filters.priority?.length) summary.push(`Priority: ${filters.priority.join(', ')}`);
    return summary.slice(0, 3).join(', ') + (summary.length > 3 ? '...' : '');
  };

  const favoriteSearches = searches.filter(s => s.isFavorite);
  const recentSearches = searches.filter(s => !s.isFavorite).slice(0, 5);

  return (
    
      {favoriteSearches.length > 0 && (
        <Card sx={{ mb: 2 }}>
          
            <Typography variant="h6" gutterBottom>
              Favorite Searches
            </Typography>
            
              {favoriteSearches.map((search) => (
                <ListItem key={search.id} divider>
                  <ListItemText
                    primary={search.name}
                    secondary={
                      
                        <Typography variant="body2" color="text.secondary">
                          {getFilterSummary(search.filters)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip size="small" label={`Used ${search.usageCount} times`} />
                          <Chip size="small" label={formatDate(search.createdAt)} color="primary" />
                        </Box>
                      </Box>
                  />
                  
                    <IconButton
                      size="small"
                      onClick={() => onToggleFavorite(search.id)}
                      color="primary"
                    >
                      <StarIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleShare(search)}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onLoadSearch(search.filters)}
                      color="primary"
                    >
                      <SearchIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteSearch(search.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {searches.length === 0 && (
        <Alert severity="info">
          No saved searches yet. Use the advanced search form to create and save your first search.
        </Alert>
      )}

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        Share Search
        
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Share this search with others by copying the link below:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={shareUrl}
            variant="outlined"
            InputProps={{
              readOnly,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        
          <PrimaryButton onClick={() => setShareDialogOpen(false)}>Cancel
          <PrimaryButton onClick={copyToClipboard} variant="contained">
            Copy Link
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedSearches;
, ' as Search ,
  Edit ,
  Delete ,
  Star ,
  StarBorder ,
  Share ,
'
const SavedSearches = ({
  searches,
  onLoadSearch,
  onDeleteSearch,
  onToggleFavorite,
  onShareSearch,
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [shareUrl, setShareUrl] = useState('');

  const handleShare = (search) => {
    setSelectedSearch(search);
    const encodedFilters = encodeURIComponent(JSON.stringify(search.filters));
    const url = `${window.location.origin}/search?filters=${encodedFilters}`;
    setShareUrl(url);
    setShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
  };

  const getFilterSummary = (filters) => {
    const summary = [];
    if (filters.query) summary.push(`"${filters.query}"`);
    if (filters.status?.length) summary.push(`Status: ${filters.status.join(', ')}`);
    if (filters.priority?.length) summary.push(`Priority: ${filters.priority.join(', ')}`);
    return summary.slice(0, 3).join(', ') + (summary.length > 3 ? '...' : '');
  };

  const favoriteSearches = searches.filter(s => s.isFavorite);
  const recentSearches = searches.filter(s => !s.isFavorite).slice(0, 5);

  return (
    
      {favoriteSearches.length > 0 && (
        <Card sx={{ mb: 2 }}>
          
            <Typography variant="h6" gutterBottom>
              Favorite Searches
            </Typography>
            
              {favoriteSearches.map((search) => (
                <ListItem key={search.id} divider>
                  <ListItemText
                    primary={search.name}
                    secondary={
                      
                        <Typography variant="body2" color="text.secondary">
                          {getFilterSummary(search.filters)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip size="small" label={`Used ${search.usageCount} times`} />
                          <Chip size="small" label={formatDate(search.createdAt)} color="primary" />
                        </Box>
                      </Box>
                  />
                  
                    <IconButton
                      size="small"
                      onClick={() => onToggleFavorite(search.id)}
                      color="primary"
                    >
                      <StarIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleShare(search)}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onLoadSearch(search.filters)}
                      color="primary"
                    >
                      <SearchIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteSearch(search.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {searches.length === 0 && (
        <Alert severity="info">
          No saved searches yet. Use the advanced search form to create and save your first search.
        </Alert>
      )}

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        Share Search
        
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Share this search with others by copying the link below:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={shareUrl}
            variant="outlined"
            InputProps={{
              readOnly,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        
          <PrimaryButton onClick={() => setShareDialogOpen(false)}>Cancel
          <PrimaryButton onClick={copyToClipboard} variant="contained">
            Copy Link
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedSearches;

