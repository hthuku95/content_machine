import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Box,
  Checkbox,
  Link,
  Typography,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  HourglassEmpty,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import type { ClippingJob, JobStatus } from '@/types/clipping.types';
import { PATHS } from '@/routes/paths';
import { formatDistanceToNow } from 'date-fns';

interface JobsTableViewProps {
  jobs: ClippingJob[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
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

export function JobsTableView({
  jobs,
  onCancel,
  onRetry,
  selectionMode = false,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
}: JobsTableViewProps) {
  const allSelected = jobs.length > 0 && jobs.every(job => selectedIds.has(job.id));
  const someSelected = jobs.some(job => selectedIds.has(job.id)) && !allSelected;

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {selectionMode && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            <TableCell>Status</TableCell>
            <TableCell>Video Title</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Linkage</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => {
            const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending; // Fallback to pending if invalid
            const canCancel = job.status === 'pending' || job.status === 'processing';
            const canRetry = job.status === 'failed';
            const isSelected = selectedIds.has(job.id);

            return (
              <TableRow
                key={job.id}
                hover
                selected={isSelected}
                sx={{
                  cursor: selectionMode ? 'pointer' : 'default',
                }}
                onClick={selectionMode ? () => onSelect?.(job.id) : undefined}
              >
                {selectionMode && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onSelect?.(job.id)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Chip
                    label={job.status.toUpperCase()}
                    color={statusConfig.color}
                    size="small"
                    icon={statusConfig.icon}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={PATHS.CLIPPING.JOB_DETAILS(job.id)}
                    underline="hover"
                    sx={{ fontWeight: 500 }}
                  >
                    {job.source_video_title}
                  </Link>
                  {job.current_step && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {job.current_step}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  {job.status === 'processing' ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={job.progress}
                          sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
                        />
                        <Typography variant="caption">{job.progress}%</Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {job.status === 'completed' ? '100%' : '-'}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {job.linkage?.source_channel?.channel_title || 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="View details">
                      <IconButton
                        component={RouterLink}
                        to={PATHS.CLIPPING.JOB_DETAILS(job.id)}
                        size="small"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canRetry && onRetry && (
                      <Tooltip title="Retry failed job">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(job.id);
                          }}
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canCancel && onCancel && (
                      <Tooltip title="Cancel job">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel(job.id);
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
