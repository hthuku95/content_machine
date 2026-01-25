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
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateSourceChannelRequest } from '@/types/clipping.types';

const sourceChannelSchema = z.object({
  channel_url: z.string().url('Invalid YouTube channel URL').min(1, 'Channel URL is required'),
});

interface AddSourceChannelDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: CreateSourceChannelRequest) => void;
  isLoading: boolean;
}

export function AddSourceChannelDialog({
  open,
  onClose,
  onAdd,
  isLoading,
}: AddSourceChannelDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSourceChannelRequest>({
    resolver: zodResolver(sourceChannelSchema),
  });

  const onSubmit = (data: CreateSourceChannelRequest) => {
    onAdd(data);
    reset();
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Source Channel</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add a YouTube channel to use as a source for clipping. Enter the full channel URL.
          </Typography>
          <TextField
            {...register('channel_url')}
            label="YouTube Channel URL"
            fullWidth
            placeholder="https://www.youtube.com/@channelname"
            error={!!errors.channel_url}
            helperText={errors.channel_url?.message}
            disabled={isLoading}
            sx={{ mt: 2 }}
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
            {isLoading ? 'Adding...' : 'Add Channel'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
