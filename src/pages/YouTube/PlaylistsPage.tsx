import { useState } from 'react';
import { Box, Typography, Container, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, CircularProgress, Paper } from '@mui/material';
import { Add as AddIcon, PlaylistPlay as PlaylistPlayIcon } from '@mui/icons-material';
import { usePlaylists } from '@/hooks/usePlaylists';
import { PlaylistCard } from '@/components/youtube/playlists/PlaylistCard';
import { CreatePlaylistDialog } from '@/components/youtube/playlists/CreatePlaylistDialog';
import { AddVideoToPlaylistDialog } from '@/components/youtube/playlists/AddVideoToPlaylistDialog';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import type { YouTubePlaylist } from '@/types/playlist.types';

export function PlaylistsPage() {
  const { playlists, isLoading, deletePlaylist, isDeleting } = usePlaylists();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addVideoDialogOpen, setAddVideoDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<YouTubePlaylist | null>(null);

  const handleEdit = (playlist: YouTubePlaylist) => {
    // For simplicity, reusing create dialog - in production, create separate edit dialog
    setSelectedPlaylist(playlist);
    setCreateDialogOpen(true);
  };

  const handleDelete = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setDeleteDialogOpen(true);
    }
  };

  const handleAddVideo = (playlist: YouTubePlaylist) => {
    setSelectedPlaylist(playlist);
    setAddVideoDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlaylist) {
      deletePlaylist(selectedPlaylist.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedPlaylist(null);
        },
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Playlists
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your YouTube playlists
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            Create Playlist
          </Button>
        </Box>

        {isLoading ? (
          <GridSkeleton count={6} columns={{ xs: 1, sm: 2, md: 3 }} />
        ) : playlists.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <PlaylistPlayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Playlists
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first playlist to organize your videos
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
              Create Playlist
            </Button>
          </Paper>
        ) : (
          <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3 }}>
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddVideo={handleAddVideo}
              />
            ))}
          </ResponsiveGrid>
        )}

        <CreatePlaylistDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
        <AddVideoToPlaylistDialog
          open={addVideoDialogOpen}
          playlist={selectedPlaylist}
          onClose={() => setAddVideoDialogOpen(false)}
        />

        <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Playlist</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{selectedPlaylist?.title}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              color="error"
              disabled={isDeleting}
              startIcon={isDeleting && <CircularProgress size={16} />}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
