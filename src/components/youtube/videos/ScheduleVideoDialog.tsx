import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { scheduleDateSchema, type ScheduleDateInput } from '@/utils/youtube-validation.schemas';
import { useVideos } from '@/hooks/useVideos';
import type { YouTubeVideo } from '@/types/video.types';

export interface ScheduleVideoDialogProps {
  open: boolean;
  video: YouTubeVideo | null;
  onClose: () => void;
}

export function ScheduleVideoDialog({ open, video, onClose }: ScheduleVideoDialogProps) {
  const { scheduleVideo, isScheduling } = useVideos();
  const [scheduledTime, setScheduledTime] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScheduleDateInput>({
    resolver: zodResolver(scheduleDateSchema),
  });

  const onSubmit = (data: ScheduleDateInput) => {
    if (!video) return;
    scheduleVideo(
      { videoId: video.id, data },
      {
        onSuccess: () => {
          onClose();
          reset();
          setScheduledTime('');
        },
      }
    );
  };

  const handleClose = () => {
    if (!isScheduling) {
      onClose();
      reset();
      setScheduledTime('');
    }
  };

  // Get minimum datetime (now)
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Video</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Schedule <strong>{video?.title}</strong> to be published at a specific time.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            The video's privacy status will automatically change to "Public" at the scheduled time.
          </Alert>

          <TextField
            label="Publish Date & Time"
            type="datetime-local"
            {...register('publish_at')}
            error={!!errors.publish_at}
            helperText={errors.publish_at?.message || 'Select when the video should be published'}
            disabled={isScheduling}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: minDateTime,
            }}
            value={scheduledTime}
            onChange={(e) => {
              setScheduledTime(e.target.value);
              register('publish_at').onChange(e);
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isScheduling}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isScheduling}
            startIcon={isScheduling ? <CircularProgress size={16} /> : <ScheduleIcon />}
          >
            {isScheduling ? 'Scheduling...' : 'Schedule Video'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
