import { Paper, Box, FormControl, InputLabel, Select, MenuItem, TextField, Typography } from '@mui/material';
import type { SearchFilters as SearchFiltersType } from '@/types/search.types';

export interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  disabled?: boolean;
}

export function SearchFilters({ filters, onChange, disabled = false }: SearchFiltersProps) {
  const handleOrderChange = (order: SearchFiltersType['order']) => {
    onChange({
      ...filters,
      order,
    });
  };

  const handleMaxResultsChange = (maxResults: number) => {
    onChange({
      ...filters,
      max_results: maxResults,
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }} disabled={disabled}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.order || 'relevance'}
            onChange={(e) => handleOrderChange(e.target.value as SearchFiltersType['order'])}
            label="Sort By"
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="date">Upload Date</MenuItem>
            <MenuItem value="viewCount">View Count</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Max Results"
          type="number"
          value={filters.max_results || 10}
          onChange={(e) => handleMaxResultsChange(Number(e.target.value))}
          disabled={disabled}
          inputProps={{
            min: 1,
            max: 50,
          }}
          sx={{ width: 120 }}
        />
      </Box>
    </Paper>
  );
}
