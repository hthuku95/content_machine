import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Button,
  LinearProgress,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  HourglassEmpty,
  Work as WorkIcon,
  VideoLibrary as VideoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { JobTimeline } from '@/components/clipping/JobTimeline';
import { JobErrorDisplay } from '@/components/clipping/JobErrorDisplay';
import { ClipCard } from '@/components/clipping/ClipCard';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { useJobDetail } from '@/hooks/useJobDetail';
import { useJobWebSocket } from '@/hooks/useJobWebSocket';
import { useJobs } from '@/hooks/useJobs';
import { useClips } from '@/hooks/useClips';
import { PATHS } from '@/routes/paths';
import type { JobStatus } from '@/types/clipping.types';
import { formatDistanceToNow, format } from 'date-fns';

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
  cancelled: {
    color: 'default',
    icon: <CancelIcon fontSize="small" />,
  },
  no_clips_found: {
    color: 'default',
    icon: <CheckCircleIcon fontSize="small" />,
  },
};

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJobDetail(id!);
  const isActive = job?.status === 'pending' || job?.status === 'processing';
  const { liveJob, isConnected } = useJobWebSocket(id!, isActive);
  const displayJob = job ? { ...job, ...liveJob } : job;
  const { cancelJob, isCancelling, retryJob, isRetrying } = useJobs();

  // Fetch clips for this job (filter by job_id isn't in the API, so we'll filter client-side)
  const { clips: allClips } = useClips();
  const jobClips = allClips.filter((clip) => clip.job_id === id);

  if (isLoading) {
    return (
      <AccessGate>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AccessGate>
    );
  }

  if (error) {
    return (
      <AccessGate>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Failed to Load Job
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {error instanceof Error ? error.message : 'An error occurred'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate(PATHS.CLIPPING.JOBS)}
          >
            Back to Jobs
          </Button>
        </Paper>
      </AccessGate>
    );
  }

  if (!job) {
    return (
      <AccessGate>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Job Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The job you're looking for doesn't exist or has been deleted.
          </Typography>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate(PATHS.CLIPPING.JOBS)}
          >
            Back to Jobs
          </Button>
        </Paper>
      </AccessGate>
    );
  }

  const statusConfig = STATUS_CONFIG[displayJob!.status] || STATUS_CONFIG.pending; // Fallback to pending if invalid
  const canCancel = displayJob!.status === 'pending' || displayJob!.status === 'processing';
  const canRetry = displayJob!.status === 'failed';

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      cancelJob(job!.id);
    }
  };

  const handleRetry = () => {
    if (window.confirm('Retry this failed job? It will be queued for processing again.')) {
      retryJob(job!.id);
    }
  };

  return (
    <AccessGate>
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to={PATHS.CLIPPING.JOBS} underline="hover">
            Jobs
          </Link>
          <Typography color="text.primary">Job Detail</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4">{displayJob!.source_video_title}</Typography>
              <Chip
                label={displayJob!.status.toUpperCase()}
                color={statusConfig.color}
                size="medium"
                icon={statusConfig.icon}
              />
              {isConnected && (
                <Chip label="Live" color="success" size="small" variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created {format(new Date(job!.created_at), 'PPpp')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate(PATHS.CLIPPING.JOBS)}
            >
              Back
            </Button>
            {canRetry && (
              <Button
                variant="contained"
                color="warning"
                startIcon={isRetrying ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry Job'}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isCancelling}
              >
                Cancel Job
              </Button>
            )}
          </Box>
        </Box>

        {/* Error Display */}
        <JobErrorDisplay job={displayJob!} />

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column - Details */}
          <Grid item xs={12} md={8}>
            {/* Progress Card */}
            {displayJob!.status === 'processing' && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Processing Progress
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {displayJob!.current_step || 'Processing...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {displayJob!.steps_completed != null && displayJob!.total_steps != null
                      ? `Step ${displayJob!.steps_completed}/${displayJob!.total_steps}`
                      : `${displayJob!.progress}%`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={displayJob!.progress}
                  sx={{ height: 10, borderRadius: 1 }}
                />
                {displayJob!.current_action_detail && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {displayJob!.current_action_detail}
                  </Typography>
                )}
              </Paper>
            )}

            {/* Timeline */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <JobTimeline job={displayJob!} />
            </Paper>

            {/* Generated Clips */}
            {jobClips.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <VideoIcon color="primary" />
                  <Typography variant="h6">
                    Generated Clips ({jobClips.length})
                  </Typography>
                </Box>
                <ResponsiveGrid columns={{ xs: 1, sm: 2 }}>
                  {jobClips.map((clip) => (
                    <Box
                      key={clip.id}
                      component={RouterLink}
                      to={PATHS.CLIPPING.CLIP_DETAILS(clip.id)}
                      sx={{ textDecoration: 'none' }}
                    >
                      <ClipCard clip={clip} />
                    </Box>
                  ))}
                </ResponsiveGrid>
              </Box>
            )}
          </Grid>

          {/* Right Column - Info */}
          <Grid item xs={12} md={4}>
            {/* Job Info Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Job ID
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {displayJob!.id}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Source Video ID
                  </Typography>
                  <Typography variant="body2">
                    {displayJob!.source_video_id}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={displayJob!.status.toUpperCase()}
                      color={statusConfig.color}
                      size="small"
                    />
                  </Box>
                </Box>

                {displayJob!.started_at && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Started
                    </Typography>
                    <Typography variant="body2">
                      {formatDistanceToNow(new Date(displayJob!.started_at!), { addSuffix: true })}
                    </Typography>
                  </Box>
                )}

                {displayJob!.completed_at && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="body2">
                      {formatDistanceToNow(new Date(displayJob!.completed_at!), { addSuffix: true })}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Linkage Info Card */}
            {displayJob!.linkage && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Linkage Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {displayJob!.linkage.source_channel && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Source Channel
                      </Typography>
                      <Typography variant="body2">
                        {displayJob!.linkage.source_channel.channel_title}
                      </Typography>
                    </Box>
                  )}

                  {displayJob!.linkage.destination_channel_title && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Destination Channel
                      </Typography>
                      <Typography variant="body2">
                        {displayJob!.linkage.destination_channel_title}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Clip Duration Range
                    </Typography>
                    <Typography variant="body2">
                      {displayJob!.linkage.min_clip_duration_seconds}s - {displayJob!.linkage.max_clip_duration_seconds}s
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Clips Per Video
                    </Typography>
                    <Typography variant="body2">
                      {displayJob!.linkage.clips_per_video}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </AccessGate>
  );
}
