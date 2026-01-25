import { Paper, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

export interface CommentFiltersProps {
  maxResults: number;
  onChange: (maxResults: number) => void;
  disabled?: boolean;
}

export function CommentFilters({ maxResults, onChange, disabled = false }: CommentFiltersProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comment Filters
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }} disabled={disabled}>
          <InputLabel>Max Results</InputLabel>
          <Select value={maxResults} onChange={(e) => onChange(Number(e.target.value))} label="Max Results">
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}
