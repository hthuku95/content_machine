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
import type { UploadStatus } from '@/types/clipping.types';

export interface ClipFilters {
  uploadStatus?: UploadStatus;
  linkageId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'latest' | 'views' | 'likes';
}

interface ClipsFilterPanelProps {
  filters: ClipFilters;
  onFiltersChange: (filters: ClipFilters) => void;
  linkages: Array<{ id: string; source_channel?: { channel_title: string }; destination_channel_title?: string }>;
}

export function ClipsFilterPanel({ filters, onFiltersChange, linkages }: ClipsFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof ClipFilters, value: string | undefined) => {
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            {/* Upload Status Filter */}
            <TextField
              select
              label="Upload Status"
              size="small"
              value={filters.uploadStatus || ''}
              onChange={(e) => handleFilterChange('uploadStatus', e.target.value as UploadStatus)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="uploading">Uploading</MenuItem>
              <MenuItem value="uploaded">Uploaded</MenuItem>
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

            {/* Sort By */}
            <TextField
              select
              label="Sort By"
              size="small"
              value={filters.sortBy || 'latest'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as 'latest' | 'views' | 'likes')}
            >
              <MenuItem value="latest">Latest</MenuItem>
              <MenuItem value="views">Most Views</MenuItem>
              <MenuItem value="likes">Most Likes</MenuItem>
            </TextField>

            {/* Search */}
            <TextField
              label="Search title/description"
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
              {filters.uploadStatus && (
                <Chip
                  label={`Status: ${filters.uploadStatus}`}
                  size="small"
                  onDelete={() => handleFilterChange('uploadStatus', undefined)}
                />
              )}
              {filters.linkageId && (
                <Chip
                  label="Linkage selected"
                  size="small"
                  onDelete={() => handleFilterChange('linkageId', undefined)}
                />
              )}
              {filters.sortBy && filters.sortBy !== 'latest' && (
                <Chip
                  label={`Sort: ${filters.sortBy}`}
                  size="small"
                  onDelete={() => handleFilterChange('sortBy', undefined)}
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
