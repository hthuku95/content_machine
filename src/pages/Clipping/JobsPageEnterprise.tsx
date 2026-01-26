import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Work as WorkIcon,
  FiberManualRecord as LiveIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import { AccessGate } from '@/components/clipping/AccessGate';
import { JobStatusCard } from '@/components/clipping/JobStatusCard';
import { JobsFilterPanel, type JobFilters } from '@/components/clipping/JobsFilterPanel';
import { JobsTableView } from '@/components/clipping/JobsTableView';
import { ViewToggle, type ViewMode } from '@/components/common/ViewToggle';
import { SelectableCard } from '@/components/common/SelectableCard';
import { BulkActionToolbar, bulkActionSets } from '@/components/common/BulkActionToolbar';
import { BatchJobRetryDialog } from '@/components/clipping/BatchJobRetryDialog';
import { KeyboardShortcutsDialog } from '@/components/common/KeyboardShortcutsDialog';
import { FilterPresetsManager } from '@/components/common/FilterPresetsManager';
import { useJobPolling } from '@/hooks/useJobPolling';
import { useJobs } from '@/hooks/useJobs';
import { useLinkages } from '@/hooks/useLinkages';
import { useSelection } from '@/hooks/useSelection';
import { useKeyboardShortcuts, commonShortcuts, useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';
import { useFilterPresets, commonPresets } from '@/hooks/useFilterPresets';
import { exportJobs } from '@/utils/export';
import type { JobStatus } from '@/types/clipping.types';

export function JobsPageEnterprise() {
  const [filters, setFilters] = useState<JobFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [batchRetryDialogOpen, setBatchRetryDialogOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  // Fetch data
  const { linkages } = useLinkages();
  const { jobs: pollingJobs, isLoading: isPollingLoading, isPolling } = useJobPolling();

  const apiFilters = {
    status: filters.status,
    linkage_id: filters.linkageId,
    start_date: filters.startDate,
    end_date: filters.endDate,
  };
  const { jobs: filteredJobs, isLoading: isFilteredLoading, cancelJob } = useJobs(
    Object.values(apiFilters).some(v => v !== undefined) ? apiFilters : undefined
  );

  const jobs = Object.values(apiFilters).some(v => v !== undefined) ? filteredJobs : pollingJobs;
  const isLoading = Object.values(apiFilters).some(v => v !== undefined) ? isFilteredLoading : isPollingLoading;

  const displayedJobs = useMemo(() => {
    if (!filters.search) return jobs;
    const searchLower = filters.search.toLowerCase();
    return jobs.filter(job =>
      job.source_video_title.toLowerCase().includes(searchLower)
    );
  }, [jobs, filters.search]);

  // Selection management
  const selection = useSelection<string>();

  // Filter presets
  const filterPresets = useFilterPresets<JobFilters>('jobs', Object.values(commonPresets.jobs));

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    commonShortcuts.selectAll(() => {
      if (selectionMode) {
        selection.selectAll(displayedJobs.map(j => j.id));
      }
    }),
    commonShortcuts.deselectAll(() => selection.clearSelection()),
    commonShortcuts.delete(() => {
      if (selection.selectedCount > 0) {
        handleBulkCancel();
      }
    }),
    commonShortcuts.help(() => setShortcutsDialogOpen(true)),
    {
      key: 's',
      ctrl: true,
      shift: true,
      action: () => setSelectionMode(!selectionMode),
      description: 'Toggle selection mode',
      preventDefault: true,
    },
    {
      key: 'v',
      ctrl: true,
      action: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
      description: 'Toggle view mode',
      preventDefault: true,
    },
  ], [selectionMode, selection, displayedJobs, viewMode]);

  useKeyboardShortcuts(shortcuts, true);
  const shortcutsHelp = useKeyboardShortcutsHelp(shortcuts);

  // Bulk operations
  const selectedJobs = useMemo(() => {
    return displayedJobs.filter(j => selection.isSelected(j.id));
  }, [displayedJobs, selection.selectedIds]);

  const failedSelectedJobs = selectedJobs.filter(j => j.status === 'failed');
  const activeSelectedJobs = selectedJobs.filter(
    j => j.status === 'pending' || j.status === 'processing'
  );

  const handleBulkCancel = () => {
    if (window.confirm(`Cancel ${activeSelectedJobs.length} job(s)?`)) {
      activeSelectedJobs.forEach(j => cancelJob(j.id));
      selection.clearSelection();
    }
  };

  const handleBulkRetry = () => {
    setBatchRetryDialogOpen(true);
  };

  const handleBulkExport = () => {
    exportJobs(selectedJobs, 'csv');
  };

  const handleExportAll = () => {
    exportJobs(displayedJobs, 'csv');
  };

  const bulkActions = bulkActionSets.jobs(
    handleBulkCancel,
    handleBulkRetry,
    handleBulkExport,
    {
      cancel: activeSelectedJobs.length === 0,
      retry: failedSelectedJobs.length === 0,
    }
  );

  return (
    <AccessGate>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4">Clipping Jobs</Typography>
              {isPolling && (
                <Chip
                  label="Live"
                  size="small"
                  color="success"
                  icon={<LiveIcon sx={{ fontSize: 12 }} />}
                  sx={{
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.6 },
                    },
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Monitor your active and completed clipping jobs
              {isPolling && ' (Auto-updating every 5 seconds)'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectionMode}
                  onChange={(e) => setSelectionMode(e.target.checked)}
                  size="small"
                />
              }
              label="Select"
            />
            <ViewToggle value={viewMode} onChange={setViewMode} />
            <FilterPresetsManager
              presets={filterPresets.presets}
              onApplyPreset={setFilters}
              onSavePreset={filterPresets.savePreset}
              onDeletePreset={filterPresets.deletePreset}
              onUpdatePreset={filterPresets.updatePreset}
              currentFilters={filters}
              hasActiveFilters={Object.values(filters).some(v => v !== undefined)}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExportAll}
              disabled={displayedJobs.length === 0}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <JobsFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          linkages={linkages}
        />

        {isLoading ? (
          viewMode === 'grid' ? (
            <GridSkeleton count={4} type="job" columns={{ xs: 1, md: 2 }} />
          ) : (
            <Paper sx={{ p: 2 }}>
              <Typography>Loading...</Typography>
            </Paper>
          )
        ) : displayedJobs.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Jobs Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.values(filters).some(v => v !== undefined)
                ? 'No jobs match your current filters'
                : 'Jobs will appear here when you create linkages and content is being processed'}
            </Typography>
          </Paper>
        ) : viewMode === 'grid' ? (
          <ResponsiveGrid columns={{ xs: 1, md: 2 }}>
            {displayedJobs.map((job) => (
              <SelectableCard
                key={job.id}
                id={job.id}
                selected={selection.isSelected(job.id)}
                onSelect={selection.toggleSelection}
                selectionMode={selectionMode}
              >
                <JobStatusCard job={job} onCancel={cancelJob} />
              </SelectableCard>
            ))}
          </ResponsiveGrid>
        ) : (
          <JobsTableView
            jobs={displayedJobs}
            onCancel={cancelJob}
            selectionMode={selectionMode}
            selectedIds={selection.selectedIds}
            onSelect={selection.toggleSelection}
            onSelectAll={() => {
              if (selection.selectedCount === displayedJobs.length) {
                selection.clearSelection();
              } else {
                selection.selectAll(displayedJobs.map(j => j.id));
              }
            }}
          />
        )}

        <BulkActionToolbar
          selectedCount={selection.selectedCount}
          onClear={selection.clearSelection}
          actions={bulkActions}
        />

        <BatchJobRetryDialog
          open={batchRetryDialogOpen}
          jobs={failedSelectedJobs}
          onClose={() => {
            setBatchRetryDialogOpen(false);
            selection.clearSelection();
          }}
          onRetry={async (jobIds) => {
            // In a real implementation, this would call the retry API
            // For now, we just simulate it
            console.log('Retrying jobs:', jobIds);
          }}
        />

        <KeyboardShortcutsDialog
          open={shortcutsDialogOpen}
          onClose={() => setShortcutsDialogOpen(false)}
          shortcuts={shortcutsHelp}
        />
      </Box>
    </AccessGate>
  );
}
