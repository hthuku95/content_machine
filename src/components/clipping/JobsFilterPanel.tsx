import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { JobStatus } from '@/types/clipping.types';

export interface JobFilters {
  status?: JobStatus;
  linkageId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface JobsFilterPanelProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  linkages: Array<{ id: string; source_channel?: { channel_title: string }; destination_channel_title?: string }>;
}

export function JobsFilterPanel({ filters, onFiltersChange, linkages }: JobsFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof JobFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="action" />
          <Typography variant="subtitle1">Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip label={`${activeFilterCount} active`} size="small" color="primary" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeFilterCount > 0 && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {/* Status Filter */}
            <TextField
              select
              label="Status"
              size="small"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as JobStatus)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>

            {/* Linkage Filter */}
            <TextField
              select
              label="Linkage"
              size="small"
              value={filters.linkageId || ''}
              onChange={(e) => handleFilterChange('linkageId', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {linkages.map((linkage) => (
                <MenuItem key={linkage.id} value={linkage.id}>
                  {linkage.source_channel?.channel_title || 'Unknown'} → {linkage.destination_channel_title || 'Unknown'}
                </MenuItem>
              ))}
            </TextField>

            {/* Search */}
            <TextField
              label="Search video title"
              size="small"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search..."
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {/* Start Date */}
            <TextField
              type="date"
              label="Start Date"
              size="small"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* End Date */}
            <TextField
              type="date"
              label="End Date"
              size="small"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filters.status && (
                <Chip
                  label={`Status: ${filters.status}`}
                  size="small"
                  onDelete={() => handleFilterChange('status', undefined)}
                />
              )}
              {filters.linkageId && (
                <Chip
                  label="Linkage selected"
                  size="small"
                  onDelete={() => handleFilterChange('linkageId', undefined)}
                />
              )}
              {filters.search && (
                <Chip
                  label={`Search: "${filters.search}"`}
                  size="small"
                  onDelete={() => handleFilterChange('search', undefined)}
                />
              )}
              {filters.startDate && (
                <Chip
                  label={`From: ${filters.startDate}`}
                  size="small"
                  onDelete={() => handleFilterChange('startDate', undefined)}
                />
              )}
              {filters.endDate && (
                <Chip
                  label={`To: ${filters.endDate}`}
                  size="small"
                  onDelete={() => handleFilterChange('endDate', undefined)}
                />
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
