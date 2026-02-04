import { useState } from 'react';
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
} from '@mui/material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { Add as AddIcon, Link as LinkIcon } from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { LinkageCard } from '@/components/clipping/LinkageCard';
import { CreateLinkageDialog } from '@/components/clipping/CreateLinkageDialog';
import { EditLinkageDialog } from '@/components/clipping/EditLinkageDialog';
import { useLinkages } from '@/hooks/useLinkages';
import type { ChannelLinkage } from '@/types/clipping.types';

export function LinkagesPage() {
  console.log('[LinkagesPage] Component mounted');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkageToEdit, setLinkageToEdit] = useState<ChannelLinkage | null>(null);
  const [linkageToDelete, setLinkageToDelete] = useState<string | null>(null);

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

  console.log('[LinkagesPage] Linkages loaded:', { linkagesCount: linkages.length, isLoading });

  const handleCreateSuccess = () => {
    console.log('[LinkagesPage] Action: Create linkage success');
    setCreateDialogOpen(false);
    console.log('[LinkagesPage] State updated: Create dialog closed');
  };

  const handleEditClick = (linkage: ChannelLinkage) => {
    console.log('[LinkagesPage] Action: Edit linkage', linkage.id);
    setLinkageToEdit(linkage);
    setEditDialogOpen(true);
    console.log('[LinkagesPage] State updated: Edit dialog opened');
  };

  const handleEditClose = () => {
    console.log('[LinkagesPage] Action: Close edit dialog');
    setEditDialogOpen(false);
    setLinkageToEdit(null);
    console.log('[LinkagesPage] State updated: Edit dialog closed');
  };

  const handleDeleteClick = (id: string) => {
    console.log('[LinkagesPage] Action: Delete linkage', id);
    setLinkageToDelete(id);
    setDeleteDialogOpen(true);
    console.log('[LinkagesPage] State updated: Delete dialog opened');
  };

  const handleDeleteConfirm = () => {
    if (linkageToDelete) {
      console.log('[LinkagesPage] Action: Confirm delete', linkageToDelete);
      deleteLinkage(linkageToDelete);
      setDeleteDialogOpen(false);
      setLinkageToDelete(null);
      console.log('[LinkagesPage] State updated: Delete dialog closed');
    }
  };

  const handleDeleteCancel = () => {
    console.log('[LinkagesPage] Action: Cancel delete');
    setDeleteDialogOpen(false);
    setLinkageToDelete(null);
    console.log('[LinkagesPage] State updated: Delete dialog closed');
  };

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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Linkage
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !Array.isArray(linkages) || linkages.length === 0 ? (
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
            {Array.isArray(linkages) && linkages.map((linkage) => (
              <LinkageCard
                key={linkage.id}
                linkage={linkage}
                onToggleActive={toggleActive}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
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
      </Box>
    </AccessGate>
  );
}
