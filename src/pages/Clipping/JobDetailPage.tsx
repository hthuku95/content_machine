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
} from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { JobTimeline } from '@/components/clipping/JobTimeline';
import { JobErrorDisplay } from '@/components/clipping/JobErrorDisplay';
import { ClipCard } from '@/components/clipping/ClipCard';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { useJobDetail } from '@/hooks/useJobDetail';
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
};

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJobDetail(id!);
  const { cancelJob, isCancelling } = useJobs();

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

  const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending; // Fallback to pending if invalid
  const canCancel = job.status === 'pending' || job.status === 'processing';

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      cancelJob(job.id);
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
              <Typography variant="h4">{job.source_video_title}</Typography>
              <Chip
                label={job.status.toUpperCase()}
                color={statusConfig.color}
                size="medium"
                icon={statusConfig.icon}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created {format(new Date(job.created_at), 'PPpp')}
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
        <JobErrorDisplay job={job} />

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column - Details */}
          <Grid item xs={12} md={8}>
            {/* Progress Card */}
            {job.status === 'processing' && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Processing Progress
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {job.current_step || 'Processing...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={job.progress}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Paper>
            )}

            {/* Timeline */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <JobTimeline job={job} />
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
                    {job.id}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Source Video ID
                  </Typography>
                  <Typography variant="body2">
                    {job.source_video_id}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={job.status.toUpperCase()}
                      color={statusConfig.color}
                      size="small"
                    />
                  </Box>
                </Box>

                {job.started_at && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Started
                    </Typography>
                    <Typography variant="body2">
                      {formatDistanceToNow(new Date(job.started_at), { addSuffix: true })}
                    </Typography>
                  </Box>
                )}

                {job.completed_at && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="body2">
                      {formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Linkage Info Card */}
            {job.linkage && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Linkage Settings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {job.linkage.source_channel && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Source Channel
                      </Typography>
                      <Typography variant="body2">
                        {job.linkage.source_channel.channel_title}
                      </Typography>
                    </Box>
                  )}

                  {job.linkage.destination_channel_title && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Destination Channel
                      </Typography>
                      <Typography variant="body2">
                        {job.linkage.destination_channel_title}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Clip Duration Range
                    </Typography>
                    <Typography variant="body2">
                      {job.linkage.min_clip_duration_seconds}s - {job.linkage.max_clip_duration_seconds}s
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Clips Per Video
                    </Typography>
                    <Typography variant="body2">
                      {job.linkage.clips_per_video}
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
