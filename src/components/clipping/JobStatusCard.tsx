import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  CardActionArea,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  HourglassEmpty,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { ClippingJob, JobStatus } from '@/types/clipping.types';
import { PATHS } from '@/routes/paths';
import { formatDistanceToNow } from 'date-fns';

interface JobStatusCardProps {
  job: ClippingJob;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
}

const STATUS_CONFIG: Record<
  JobStatus,
  { color: 'default' | 'primary' | 'success' | 'error'; icon: React.ReactNode }
> = {
  pending: {
    color: 'default',
    icon: <PendingIcon fontSize="small" />,
  },
  processing: {
    color: 'primary',
    icon: <HourglassEmpty fontSize="small" />,
  },
  completed: {
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />,
  },
  failed: {
    color: 'error',
    icon: <ErrorIcon fontSize="small" />,
  },
};

export function JobStatusCard({ job, onCancel, onRetry }: JobStatusCardProps) {
  const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending; // Fallback to pending if invalid
  const canCancel = job.status === 'pending' || job.status === 'processing';
  const canRetry = job.status === 'failed';

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCancel) {
      onCancel(job.id);
    }
  };

  const handleRetryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRetry) {
      onRetry(job.id);
    }
  };

  return (
    <Card>
      <CardActionArea component={RouterLink} to={PATHS.CLIPPING.JOB_DETAILS(job.id)}>
        <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom noWrap>
              {job.source_video_title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {job.started_at
                ? `Started ${formatDistanceToNow(new Date(job.started_at), { addSuffix: true })}`
                : 'Not started yet'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={job.status.toUpperCase()}
              color={statusConfig.color}
              size="small"
            />
            {canRetry && onRetry && (
              <Tooltip title="Retry failed job">
                <IconButton size="small" color="primary" onClick={handleRetryClick}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            {canCancel && onCancel && (
              <Tooltip title="Cancel job">
                <IconButton size="small" color="error" onClick={handleCancelClick}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {job.status === 'processing' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {job.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={job.progress}
              sx={{
                height: 8,
                borderRadius: 1,
              }}
            />
            {job.current_step && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {job.current_step}
              </Typography>
            )}
          </Box>
        )}

        {job.status === 'failed' && job.error_message && (
          <Box
            sx={{
              bgcolor: 'error.light',
              color: 'error.contrastText',
              p: 1,
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="caption">{job.error_message}</Typography>
          </Box>
        )}

        {job.status === 'completed' && job.completed_at && (
          <Typography variant="caption" color="success.main">
            Completed {formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}
          </Typography>
        )}
      </CardContent>
      </CardActionArea>
    </Card>
  );
}
