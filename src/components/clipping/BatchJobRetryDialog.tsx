import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Refresh as RetryIcon,
} from '@mui/icons-material';
import type { ClippingJob } from '@/types/clipping.types';

interface BatchJobRetryDialogProps {
  open: boolean;
  jobs: ClippingJob[];
  onClose: () => void;
  onRetry: (jobIds: string[]) => Promise<void>;
}

interface RetryStatus {
  jobId: string;
  status: 'pending' | 'retrying' | 'success' | 'error';
  error?: string;
}

export function BatchJobRetryDialog({
  open,
  jobs,
  onClose,
  onRetry,
}: BatchJobRetryDialogProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [statuses, setStatuses] = useState<RetryStatus[]>([]);

  useEffect(() => {
    if (open) {
      setStatuses(jobs.map(job => ({
        jobId: job.id,
        status: 'pending',
      })));
    }
  }, [open, jobs]);

  const handleRetry = async () => {
    setIsRetrying(true);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];

      setStatuses(prev =>
        prev.map(s =>
          s.jobId === job.id ? { ...s, status: 'retrying' } : s
        )
      );

      try {
        await onRetry([job.id]);

        setStatuses(prev =>
          prev.map(s =>
            s.jobId === job.id ? { ...s, status: 'success' } : s
          )
        );

        // Small delay between retries
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        setStatuses(prev =>
          prev.map(s =>
            s.jobId === job.id
              ? {
                  ...s,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error',
                }
              : s
          )
        );
      }
    }

    setIsRetrying(false);
  };

  const successCount = statuses.filter(s => s.status === 'success').length;
  const errorCount = statuses.filter(s => s.status === 'error').length;
  const progress = ((successCount + errorCount) / jobs.length) * 100;

  const canClose = !isRetrying;

  return (
    <Dialog open={open} onClose={canClose ? onClose : undefined} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RetryIcon />
          Batch Retry Failed Jobs
        </Box>
      </DialogTitle>

      <DialogContent>
        {!isRetrying && statuses.every(s => s.status === 'pending') && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to retry {jobs.length} failed job{jobs.length > 1 ? 's' : ''}. This will
            requeue them for processing.
          </Alert>
        )}

        {isRetrying && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Processing: {successCount + errorCount} / {jobs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
          </Box>
        )}

        {(isRetrying || statuses.some(s => s.status !== 'pending')) && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              label={`${successCount} Successful`}
              color="success"
              size="small"
            />
            <Chip
              label={`${errorCount} Failed`}
              color="error"
              size="small"
            />
          </Box>
        )}

        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
          {jobs.map((job, index) => {
            const status = statuses[index];
            return (
              <ListItem key={job.id}>
                <ListItemIcon>
                  {status?.status === 'success' && <SuccessIcon color="success" />}
                  {status?.status === 'error' && <ErrorIcon color="error" />}
                  {status?.status === 'retrying' && (
                    <Box sx={{ display: 'flex', animation: 'spin 1s linear infinite' }}>
                      <RetryIcon color="primary" />
                    </Box>
                  )}
                  {status?.status === 'pending' && <PendingIcon color="disabled" />}
                </ListItemIcon>
                <ListItemText
                  primary={job.source_video_title}
                  secondary={
                    status?.error || (status?.status === 'success' ? 'Retried successfully' : '')
                  }
                  secondaryTypographyProps={{
                    color: status?.status === 'error' ? 'error' : 'text.secondary',
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={!canClose}>
          {isRetrying ? 'Retry in progress...' : 'Close'}
        </Button>
        {!isRetrying && statuses.every(s => s.status === 'pending') && (
          <Button
            variant="contained"
            startIcon={<RetryIcon />}
            onClick={handleRetry}
          >
            Retry All ({jobs.length})
          </Button>
        )}
      </DialogActions>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Dialog>
  );
}
