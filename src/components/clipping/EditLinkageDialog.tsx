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
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import type { ChannelLinkage, UpdateLinkageRequest } from '@/types/clipping.types';

type UpdateLinkageFormValues = {
  min_clip_duration_seconds: number;
  max_clip_duration_seconds: number;
  clips_per_video: number;
  is_active: boolean;
};

const updateLinkageSchema: z.ZodType<UpdateLinkageFormValues> = z.object({
  min_clip_duration_seconds: z.coerce.number().min(10).max(300),
  max_clip_duration_seconds: z.coerce.number().min(10).max(300),
  clips_per_video: z.coerce.number().min(1).max(10),
  is_active: z.boolean(),
}).refine(data => data.max_clip_duration_seconds >= data.min_clip_duration_seconds, {
  message: 'Max duration must be >= min duration',
  path: ['max_clip_duration_seconds'],
});

interface EditLinkageDialogProps {
  open: boolean;
  linkage: ChannelLinkage | null;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateLinkageRequest) => void;
  isLoading: boolean;
}

export function EditLinkageDialog({
  open,
  linkage,
  onClose,
  onUpdate,
  isLoading,
}: EditLinkageDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateLinkageFormValues>({
    resolver: zodResolver(updateLinkageSchema as never) as Resolver<UpdateLinkageFormValues>,
  });

  // Update form when linkage changes
  useEffect(() => {
    if (linkage) {
      reset({
        min_clip_duration_seconds: linkage.min_clip_duration_seconds,
        max_clip_duration_seconds: linkage.max_clip_duration_seconds,
        clips_per_video: linkage.clips_per_video,
        is_active: linkage.is_active,
      });
    }
  }, [linkage, reset]);

  const minDuration = watch('min_clip_duration_seconds');

  const onSubmit = (data: UpdateLinkageFormValues) => {
    if (linkage) {
      onUpdate(linkage.id, data);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!linkage) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Linkage Settings</DialogTitle>
      <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data as UpdateLinkageFormValues))}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Update the settings for this linkage. Source and destination channels cannot be changed.
          </Typography>

          {/* Read-only source and destination info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Source Channel
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {linkage.source_channel?.channel_title || linkage.source_channel_name || 'Unknown'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Destination Channel
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {linkage.destination_channel_title || linkage.destination_channel_name || 'Unknown'}
              </Typography>
            </Box>
          </Box>

          {/* Editable fields */}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  {errors.max_clip_duration_seconds && (
                    <Typography variant="caption" color="error">
                      {errors.max_clip_duration_seconds.message}
                    </Typography>
                  )}
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

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                }
                label="Active"
                sx={{ mt: 2 }}
              />
            )}
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
            {isLoading ? 'Updating...' : 'Update Linkage'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
