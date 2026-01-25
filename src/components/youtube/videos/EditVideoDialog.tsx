import { useEffect } from 'react';
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
  Chip,
  Autocomplete,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateVideoSchema, type UpdateVideoInput } from '@/utils/youtube-validation.schemas';
import { useVideos } from '@/hooks/useVideos';
import type { YouTubeVideo } from '@/types/video.types';

export interface EditVideoDialogProps {
  open: boolean;
  video: YouTubeVideo | null;
  onClose: () => void;
}

export function EditVideoDialog({ open, video, onClose }: EditVideoDialogProps) {
  const { updateVideo, isUpdating } = useVideos();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UpdateVideoInput>({
    resolver: zodResolver(updateVideoSchema),
  });

  useEffect(() => {
    if (video) {
      reset({
        title: video.title || '',
        description: video.description || '',
        privacy_status: video.privacy_status,
        category_id: video.category_id || undefined,
        tags: video.tags || [],
      });
    }
  }, [video, reset]);

  const onSubmit = (data: UpdateVideoInput) => {
    if (!video) return;
    updateVideo(
      { videoId: video.id, data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Video</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              label="Title"
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
              disabled={isUpdating}
              fullWidth
            />

            <TextField
              label="Description"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={isUpdating}
              multiline
              rows={4}
              fullWidth
            />

            <FormControl fullWidth error={!!errors.privacy_status}>
              <InputLabel>Privacy</InputLabel>
              <Select {...register('privacy_status')} disabled={isUpdating} defaultValue="private">
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="unlisted">Unlisted</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
              {errors.privacy_status && <FormHelperText>{errors.privacy_status.message}</FormHelperText>}
            </FormControl>

            <TextField
              label="Category ID"
              {...register('category_id')}
              error={!!errors.category_id}
              helperText={errors.category_id?.message || 'Optional: YouTube category ID (e.g., 22 for People & Blogs)'}
              disabled={isUpdating}
              fullWidth
            />

            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  freeSolo
                  options={[]}
                  value={field.value || []}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option} {...getTagProps({ index })} key={option} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags..."
                      error={!!errors.tags}
                      helperText={errors.tags?.message || 'Press Enter to add a tag'}
                      disabled={isUpdating}
                    />
                  )}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
