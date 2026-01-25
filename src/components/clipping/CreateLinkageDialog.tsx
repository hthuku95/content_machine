import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  MenuItem,
  Slider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateLinkageRequest } from '@/types/clipping.types';
import { useSourceChannels } from '@/hooks/useSourceChannels';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';

const linkageSchema = z.object({
  source_channel_id: z.string().min(1, 'Source channel is required'),
  destination_channel_id: z.string().min(1, 'Destination channel is required'),
  min_clip_duration_seconds: z.number().min(10).max(300),
  max_clip_duration_seconds: z.number().min(10).max(300),
  clips_per_video: z.number().min(1).max(10),
});

interface CreateLinkageDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateLinkageRequest) => void;
  isLoading: boolean;
}

export function CreateLinkageDialog({
  open,
  onClose,
  onCreate,
  isLoading,
}: CreateLinkageDialogProps) {
  const { channels: sourceChannels } = useSourceChannels();

  // Fetch connected YouTube channels for destination
  const { data: destinationChannels = [] } = useQuery({
    queryKey: ['youtube', 'channels'],
    queryFn: async () => {
      const response = await api.get('/api/youtube/channels');
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateLinkageRequest>({
    resolver: zodResolver(linkageSchema),
    defaultValues: {
      min_clip_duration_seconds: 30,
      max_clip_duration_seconds: 60,
      clips_per_video: 3,
    },
  });

  const minDuration = watch('min_clip_duration_seconds');

  const onSubmit = (data: CreateLinkageRequest) => {
    onCreate(data);
    reset();
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Channel Linkage</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create a linkage between a source channel and your destination channel. Clips will be
            automatically extracted and uploaded.
          </Typography>

          <TextField
            {...register('source_channel_id')}
            select
            label="Source Channel"
            fullWidth
            margin="normal"
            error={!!errors.source_channel_id}
            helperText={errors.source_channel_id?.message}
            disabled={isLoading}
          >
            {sourceChannels.map((channel) => (
              <MenuItem key={channel.id} value={channel.id}>
                {channel.channel_title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            {...register('destination_channel_id')}
            select
            label="Destination Channel"
            fullWidth
            margin="normal"
            error={!!errors.destination_channel_id}
            helperText={errors.destination_channel_id?.message}
            disabled={isLoading}
          >
            {destinationChannels.map((channel: any) => (
              <MenuItem key={channel.id} value={channel.id}>
                {channel.channel_title}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Clip Duration Range (seconds)
            </Typography>
            <Controller
              name="min_clip_duration_seconds"
              control={control}
              render={({ field }) => (
                <Box sx={{ px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Minimum: {field.value}s
                  </Typography>
                  <Slider
                    {...field}
                    min={10}
                    max={300}
                    step={5}
                    marks={[
                      { value: 10, label: '10s' },
                      { value: 60, label: '1m' },
                      { value: 180, label: '3m' },
                      { value: 300, label: '5m' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            />
            <Controller
              name="max_clip_duration_seconds"
              control={control}
              render={({ field }) => (
                <Box sx={{ px: 1, mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Maximum: {field.value}s
                  </Typography>
                  <Slider
                    {...field}
                    min={minDuration || 10}
                    max={300}
                    step={5}
                    marks={[
                      { value: 60, label: '1m' },
                      { value: 180, label: '3m' },
                      { value: 300, label: '5m' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            />
          </Box>

          <TextField
            {...register('clips_per_video', { valueAsNumber: true })}
            type="number"
            label="Clips per Video"
            fullWidth
            margin="normal"
            inputProps={{ min: 1, max: 10 }}
            error={!!errors.clips_per_video}
            helperText={errors.clips_per_video?.message || 'How many clips to extract from each video'}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            {isLoading ? 'Creating...' : 'Create Linkage'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
