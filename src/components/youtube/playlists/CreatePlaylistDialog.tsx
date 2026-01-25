import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPlaylistSchema, type CreatePlaylistInput } from '@/utils/youtube-validation.schemas';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useConnectedChannels } from '@/hooks/useConnectedChannels';

export interface CreatePlaylistDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePlaylistDialog({ open, onClose }: CreatePlaylistDialogProps) {
  const { createPlaylist, isCreating } = usePlaylists();
  const { channels } = useConnectedChannels();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CreatePlaylistInput>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: {
      privacy_status: 'private',
    },
  });

  const onSubmit = (data: CreatePlaylistInput) => {
    createPlaylist(data, {
      onSuccess: () => {
        onClose();
        reset();
      },
    });
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Playlist</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <Controller
              name="channel_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.channel_id}>
                  <InputLabel>Channel</InputLabel>
                  <Select {...field} disabled={isCreating || channels.length === 0}>
                    {channels.map((channel) => (
                      <MenuItem key={channel.id} value={channel.id}>
                        {channel.channel_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.channel_id && <FormHelperText>{errors.channel_id.message}</FormHelperText>}
                  {channels.length === 0 && (
                    <FormHelperText>No channels connected. Please connect a YouTube channel first.</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <TextField
              label="Title"
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
              disabled={isCreating}
              fullWidth
            />

            <TextField
              label="Description"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={isCreating}
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth error={!!errors.privacy_status}>
              <InputLabel>Privacy</InputLabel>
              <Select {...register('privacy_status')} disabled={isCreating} defaultValue="private">
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="unlisted">Unlisted</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
              {errors.privacy_status && <FormHelperText>{errors.privacy_status.message}</FormHelperText>}
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating || channels.length === 0}
            startIcon={isCreating ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {isCreating ? 'Creating...' : 'Create Playlist'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
