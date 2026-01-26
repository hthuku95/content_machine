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
  TextField,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import { Add as AddIcon, VideoLibrary as VideoLibraryIcon, Search as SearchIcon } from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { SourceChannelCard } from '@/components/clipping/SourceChannelCard';
import { AddSourceChannelDialog } from '@/components/clipping/AddSourceChannelDialog';
import { useSourceChannels } from '@/hooks/useSourceChannels';

export function SourceChannelsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const {
    channels,
    isLoading,
    addChannel,
    toggleActive,
    removeChannel,
    isAdding,
    isRemoving,
  } = useSourceChannels();

  // Apply search and filter
  const filteredChannels = useMemo(() => {
    let result = channels;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(channel =>
        channel.channel_title.toLowerCase().includes(searchLower) ||
        channel.channel_id.toLowerCase().includes(searchLower)
      );
    }

    // Active status filter
    if (activeFilter === 'active') {
      result = result.filter(channel => channel.is_active);
    } else if (activeFilter === 'inactive') {
      result = result.filter(channel => !channel.is_active);
    }

    return result;
  }, [channels, searchQuery, activeFilter]);

  const handleAddSuccess = () => {
    setAddDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setChannelToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (channelToDelete) {
      removeChannel(channelToDelete);
      setDeleteDialogOpen(false);
      setChannelToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setChannelToDelete(null);
  };

  return (
    <AccessGate>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Source Channels
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage YouTube channels to use as content sources for clipping
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Source Channel
          </Button>
        </Box>

        {/* Search and Filter Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search channels..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Status"
            size="small"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
            sx={{ minWidth: { xs: '100%', sm: 150 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Box>

        {isLoading ? (
          <GridSkeleton count={4} type="card" columns={{ xs: 1, md: 2 }} />
        ) : channels.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <VideoLibraryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Source Channels
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add your first YouTube channel to start clipping content
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Source Channel
            </Button>
          </Paper>
        ) : filteredChannels.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <VideoLibraryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Matching Channels
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No channels match your search or filter criteria
            </Typography>
          </Paper>
        ) : (
          <ResponsiveGrid columns={{ xs: 1, md: 2 }}>
            {filteredChannels.map((channel) => (
              <SourceChannelCard
                key={channel.id}
                channel={channel}
                onToggleActive={toggleActive}
                onDelete={handleDeleteClick}
              />
            ))}
          </ResponsiveGrid>
        )}

        <AddSourceChannelDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onAdd={(data) => {
            addChannel(data);
            handleAddSuccess();
          }}
          isLoading={isAdding}
        />

        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Source Channel</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this source channel? This will also remove all
              associated linkages and stop any active clipping jobs.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isRemoving}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={isRemoving}>
              {isRemoving ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AccessGate>
  );
}
