import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { Add as AddIcon, Link as LinkIcon, Download as DownloadIcon } from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { LinkageCard } from '@/components/clipping/LinkageCard';
import { CreateLinkageDialog } from '@/components/clipping/CreateLinkageDialog';
import { EditLinkageDialog } from '@/components/clipping/EditLinkageDialog';
import { SelectableCard } from '@/components/common/SelectableCard';
import { BulkActionToolbar, bulkActionSets } from '@/components/common/BulkActionToolbar';
import { KeyboardShortcutsDialog } from '@/components/common/KeyboardShortcutsDialog';
import { useLinkages } from '@/hooks/useLinkages';
import { useSelection } from '@/hooks/useSelection';
import { useKeyboardShortcuts, commonShortcuts, useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';
import { useBatchRetry } from '@/hooks/useRetry';
import { exportLinkages } from '@/utils/export';
import type { ChannelLinkage } from '@/types/clipping.types';

export function LinkagesPageEnterprise() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkageToEdit, setLinkageToEdit] = useState<ChannelLinkage | null>(null);
  const [linkageToDelete, setLinkageToDelete] = useState<string | null>(null);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const {
    linkages,
    isLoading,
    createLinkage,
    updateLinkage,
    toggleActive,
    deleteLinkage,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLinkages();

  const selection = useSelection<string>();
  // Wrap updateLinkage to match useBatchRetry expected signature
  const { retryBatch } = useBatchRetry(async (id: string, data: any) => {
    return updateLinkage({ id, data });
  });

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    commonShortcuts.selectAll(() => {
      if (selectionMode) {
        selection.selectAll(linkages.map(l => l.id));
      }
    }),
    commonShortcuts.deselectAll(() => selection.clearSelection()),
    commonShortcuts.delete(() => {
      if (selection.selectedCount > 0) {
        handleBulkDelete();
      }
    }),
    commonShortcuts.newItem(() => setCreateDialogOpen(true)),
    commonShortcuts.help(() => setShortcutsDialogOpen(true)),
    {
      key: 's',
      ctrl: true,
      shift: true,
      action: () => setSelectionMode(!selectionMode),
      description: 'Toggle selection mode',
      preventDefault: true,
    },
  ], [selectionMode, selection, linkages]);

  useKeyboardShortcuts(shortcuts, true);
  const shortcutsHelp = useKeyboardShortcutsHelp(shortcuts);

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  const handleEditClick = (linkage: ChannelLinkage) => {
    setLinkageToEdit(linkage);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setLinkageToEdit(null);
  };

  const handleDeleteClick = (id: string) => {
    setLinkageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (linkageToDelete) {
      deleteLinkage(linkageToDelete);
      setDeleteDialogOpen(false);
      setLinkageToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLinkageToDelete(null);
  };

  // Bulk operations
  const selectedLinkages = useMemo(() => {
    return linkages.filter(l => selection.isSelected(l.id));
  }, [linkages, selection.selectedIds]);

  const handleBulkEnable = async () => {
    const updates = selectedLinkages.map(l => [l.id, { is_active: true }] as [string, any]);
    await retryBatch(updates);
    selection.clearSelection();
  };

  const handleBulkDisable = async () => {
    const updates = selectedLinkages.map(l => [l.id, { is_active: false }] as [string, any]);
    await retryBatch(updates);
    selection.clearSelection();
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selection.selectedCount} linkage(s)? This cannot be undone.`)) {
      selectedLinkages.forEach(l => deleteLinkage(l.id));
      selection.clearSelection();
    }
  };

  const handleBulkExport = () => {
    exportLinkages(selectedLinkages, 'csv');
  };

  const handleExportAll = () => {
    exportLinkages(linkages, 'csv');
  };

  const bulkActions = bulkActionSets.linkages(
    handleBulkEnable,
    handleBulkDisable,
    handleBulkDelete,
    {
      enable: selectedLinkages.every(l => l.is_active),
      disable: selectedLinkages.every(l => !l.is_active),
    }
  );

  // Add export action
  bulkActions.push({
    label: 'Export',
    icon: <DownloadIcon />,
    onClick: handleBulkExport,
    color: 'secondary',
    tooltip: 'Export selected linkages to CSV',
  });

  return (
    <AccessGate>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Channel Linkages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect source channels to destination channels for automated clipping
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectionMode}
                  onChange={(e) => setSelectionMode(e.target.checked)}
                  size="small"
                />
              }
              label="Select"
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportAll}
              disabled={linkages.length === 0}
            >
              Export All
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Linkage
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : linkages.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <LinkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Channel Linkages
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first linkage to start automatically clipping content
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Linkage
            </Button>
          </Paper>
        ) : (
          <ResponsiveGrid columns={{ xs: 1, md: 2 }}>
            {linkages.map((linkage) => (
              <SelectableCard
                key={linkage.id}
                id={linkage.id}
                selected={selection.isSelected(linkage.id)}
                onSelect={selection.toggleSelection}
                selectionMode={selectionMode}
              >
                <LinkageCard
                  linkage={linkage}
                  onToggleActive={toggleActive}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              </SelectableCard>
            ))}
          </ResponsiveGrid>
        )}

        <CreateLinkageDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreate={(data) => {
            createLinkage(data);
            handleCreateSuccess();
          }}
          isLoading={isCreating}
        />

        <EditLinkageDialog
          open={editDialogOpen}
          linkage={linkageToEdit}
          onClose={handleEditClose}
          onUpdate={(id, data) => updateLinkage({ id, data })}
          isLoading={isUpdating}
        />

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Linkage</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this linkage? This will stop all associated clipping
              jobs.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting}>
              {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        <KeyboardShortcutsDialog
          open={shortcutsDialogOpen}
          onClose={() => setShortcutsDialogOpen(false)}
          shortcuts={shortcutsHelp}
        />

        <BulkActionToolbar
          selectedCount={selection.selectedCount}
          onClear={selection.clearSelection}
          actions={bulkActions}
        />
      </Box>
    </AccessGate>
  );
}
