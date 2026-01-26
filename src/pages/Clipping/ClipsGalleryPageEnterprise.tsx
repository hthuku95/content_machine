import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import { AccessGate } from '@/components/clipping/AccessGate';
import { ClipCard } from '@/components/clipping/ClipCard';
import { ClipsFilterPanel, type ClipFilters } from '@/components/clipping/ClipsFilterPanel';
import { ClipsTableView } from '@/components/clipping/ClipsTableView';
import { ViewToggle, type ViewMode } from '@/components/common/ViewToggle';
import { SelectableCard } from '@/components/common/SelectableCard';
import { BulkActionToolbar, bulkActionSets } from '@/components/common/BulkActionToolbar';
import { KeyboardShortcutsDialog } from '@/components/common/KeyboardShortcutsDialog';
import { FilterPresetsManager } from '@/components/common/FilterPresetsManager';
import { useClips } from '@/hooks/useClips';
import { useLinkages } from '@/hooks/useLinkages';
import { useSelection } from '@/hooks/useSelection';
import { useKeyboardShortcuts, commonShortcuts, useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';
import { useFilterPresets, commonPresets } from '@/hooks/useFilterPresets';
import { exportClips } from '@/utils/export';

export function ClipsGalleryPageEnterprise() {
  const [filters, setFilters] = useState<ClipFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  const { linkages } = useLinkages();

  const apiFilters = {
    upload_status: filters.uploadStatus,
    linkage_id: filters.linkageId,
    start_date: filters.startDate,
    end_date: filters.endDate,
  };

  const {
    clips,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    repostClip,
  } = useClips(
    Object.values(apiFilters).some(v => v !== undefined) ? apiFilters : undefined
  );

  const displayedClips = useMemo(() => {
    let result = [...clips];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(clip =>
        clip.title.toLowerCase().includes(searchLower) ||
        clip.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.sortBy === 'views') {
      result.sort((a, b) => b.views_count - a.views_count);
    } else if (filters.sortBy === 'likes') {
      result.sort((a, b) => b.likes_count - a.likes_count);
    }

    return result;
  }, [clips, filters.search, filters.sortBy]);

  // Selection management
  const selection = useSelection<string>();

  // Filter presets
  const filterPresets = useFilterPresets<ClipFilters>('clips', Object.values(commonPresets.clips));

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    commonShortcuts.selectAll(() => {
      if (selectionMode) {
        selection.selectAll(displayedClips.map(c => c.id));
      }
    }),
    commonShortcuts.deselectAll(() => selection.clearSelection()),
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
  ], [selectionMode, selection, displayedClips, viewMode]);

  useKeyboardShortcuts(shortcuts, true);
  const shortcutsHelp = useKeyboardShortcutsHelp(shortcuts);

  // Bulk operations
  const selectedClips = useMemo(() => {
    return displayedClips.filter(c => selection.isSelected(c.id));
  }, [displayedClips, selection.selectedIds]);

  const failedSelectedClips = selectedClips.filter(c => c.upload_status === 'failed');

  const handleBulkRepost = () => {
    if (window.confirm(`Repost ${failedSelectedClips.length} failed clip(s)?`)) {
      failedSelectedClips.forEach(c => repostClip(c.id));
      selection.clearSelection();
    }
  };

  const handleBulkExport = () => {
    exportClips(selectedClips, 'csv');
  };

  const handleExportAll = () => {
    exportClips(displayedClips, 'csv');
  };

  const bulkActions = bulkActionSets.clips(
    handleBulkRepost,
    handleBulkExport,
    () => {}, // Delete not implemented for clips
    {
      repost: failedSelectedClips.length === 0,
      delete: true, // Disable delete
    }
  );

  return (
    <AccessGate>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Clips Gallery
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse and manage your extracted clips ({displayedClips.length} total)
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
              disabled={displayedClips.length === 0}
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

        <ClipsFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          linkages={linkages}
        />

        {isLoading ? (
          viewMode === 'grid' ? (
            <GridSkeleton count={6} type="clip" columns={{ xs: 1, sm: 2, md: 3 }} />
          ) : (
            <Paper sx={{ p: 2 }}>
              <Typography>Loading...</Typography>
            </Paper>
          )
        ) : displayedClips.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <MovieIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Clips Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.values(filters).some(v => v !== undefined)
                ? 'No clips match your current filters'
                : 'Clips will appear here once clipping jobs complete'}
            </Typography>
          </Paper>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3 }}>
                {displayedClips.map((clip) => (
                  <SelectableCard
                    key={clip.id}
                    id={clip.id}
                    selected={selection.isSelected(clip.id)}
                    onSelect={selection.toggleSelection}
                    selectionMode={selectionMode}
                  >
                    <ClipCard clip={clip} onRepost={repostClip} />
                  </SelectableCard>
                ))}
              </ResponsiveGrid>
            ) : (
              <ClipsTableView
                clips={displayedClips}
                onRepost={repostClip}
                selectionMode={selectionMode}
                selectedIds={selection.selectedIds}
                onSelect={selection.toggleSelection}
                onSelectAll={() => {
                  if (selection.selectedCount === displayedClips.length) {
                    selection.clearSelection();
                  } else {
                    selection.selectAll(displayedClips.map(c => c.id));
                  }
                }}
              />
            )}

            {hasNextPage && viewMode === 'grid' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? <CircularProgress size={24} /> : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}

        <BulkActionToolbar
          selectedCount={selection.selectedCount}
          onClear={selection.clearSelection}
          actions={bulkActions}
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
