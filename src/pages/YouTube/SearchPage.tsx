import { useState } from 'react';
import { Box, Typography, Container, Stack, Paper, CircularProgress, Alert } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useVideoSearch } from '@/hooks/useSearch';
import { SearchBar } from '@/components/youtube/search/SearchBar';
import { SearchFilters } from '@/components/youtube/search/SearchFilters';
import { VideoSearchResult } from '@/components/youtube/search/VideoSearchResult';
import type { SearchFilters as SearchFiltersType } from '@/types/search.types';

export function SearchPage() {
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    max_results: 10,
    order: 'relevance',
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data: results = [], isLoading, error } = useVideoSearch(filters);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, query }));
    setHasSearched(true);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search & Discovery
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Search for videos on YouTube
        </Typography>

        <Stack spacing={3}>
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {/* Search Filters */}
          {hasSearched && (
            <SearchFilters filters={filters} onChange={handleFiltersChange} disabled={isLoading} />
          )}

          {/* Loading State */}
          {isLoading && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Searching...
              </Typography>
            </Paper>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error">
              Failed to search. Please try again.
            </Alert>
          )}

          {/* Search Results */}
          {!isLoading && hasSearched && results.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Results ({results.length})
              </Typography>
              <Stack spacing={2}>
                {results.map((result) => (
                  <VideoSearchResult key={result.video_id} result={result} />
                ))}
              </Stack>
            </Box>
          )}

          {/* No Results */}
          {!isLoading && hasSearched && results.length === 0 && filters.query && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Results Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try different keywords or adjust your filters
              </Typography>
            </Paper>
          )}

          {/* Initial Empty State */}
          {!hasSearched && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Start Searching
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter a search query to find videos on YouTube
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>
    </Container>
  );
}
