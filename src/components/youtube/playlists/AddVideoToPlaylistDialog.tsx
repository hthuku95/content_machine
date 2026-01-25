import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Box,
  Typography,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addVideoToPlaylistSchema, type AddVideoToPlaylistInput } from '@/utils/youtube-validation.schemas';
import { usePlaylists } from '@/hooks/usePlaylists';
import type { YouTubePlaylist } from '@/types/playlist.types';

export interface AddVideoToPlaylistDialogProps {
  open: boolean;
  playlist: YouTubePlaylist | null;
  onClose: () => void;
}

export function AddVideoToPlaylistDialog({ open, playlist, onClose }: AddVideoToPlaylistDialogProps) {
  const { addVideo, isAddingVideo } = usePlaylists();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddVideoToPlaylistInput>({
    resolver: zodResolver(addVideoToPlaylistSchema),
  });

  const onSubmit = (data: AddVideoToPlaylistInput) => {
    if (!playlist) return;
    addVideo(
      { playlistId: playlist.id, data },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isAddingVideo) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Video to Playlist</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add a video to <strong>{playlist?.title}</strong>
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Video ID"
              {...register('video_id')}
              error={!!errors.video_id}
              helperText={errors.video_id?.message || 'Enter the YouTube video ID (e.g., dQw4w9WgXcQ)'}
              disabled={isAddingVideo}
              fullWidth
              placeholder="dQw4w9WgXcQ"
            />

            <TextField
              label="Position (Optional)"
              type="number"
              {...register('position', { valueAsNumber: true })}
              error={!!errors.position}
              helperText={errors.position?.message || 'Leave empty to add at the end'}
              disabled={isAddingVideo}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Stack>

          <FormHelperText sx={{ mt: 2 }}>
            The Video ID can be found in the YouTube URL: youtube.com/watch?v=<strong>VIDEO_ID</strong>
          </FormHelperText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isAddingVideo}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isAddingVideo}
            startIcon={isAddingVideo ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {isAddingVideo ? 'Adding...' : 'Add Video'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
