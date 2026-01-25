import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { Refresh as RetryIcon } from '@mui/icons-material';
import type { ClippingJob } from '@/types/clipping.types';

interface JobErrorDisplayProps {
  job: ClippingJob;
  onRetry?: () => void;
}

export function JobErrorDisplay({ job, onRetry }: JobErrorDisplayProps) {
  if (job.status !== 'failed' || !job.error_message) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="error" sx={{ alignItems: 'center' }}>
        <AlertTitle>Job Failed</AlertTitle>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {job.error_message}
        </Typography>
        {onRetry && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RetryIcon />}
            onClick={onRetry}
            sx={{ mt: 1 }}
          >
            Retry Job
          </Button>
        )}
      </Alert>
    </Box>
  );
}
