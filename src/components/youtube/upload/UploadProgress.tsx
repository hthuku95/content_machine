import { Card, CardContent, Typography, LinearProgress, Box, Alert, Link } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CloudQueue as CloudQueueIcon,
} from '@mui/icons-material';
import type { UploadProgress as UploadProgressType } from '@/types/upload.types';

export interface UploadProgressProps {
  progress: UploadProgressType;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function UploadProgress({ progress }: UploadProgressProps) {
  const percentage = Math.round(progress.percentage);

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />;
      case 'error':
        return <ErrorIcon color="error" sx={{ fontSize: 48 }} />;
      case 'processing':
        return <CloudQueueIcon color="info" sx={{ fontSize: 48 }} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Upload Complete!';
      case 'error':
        return 'Upload Failed';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>{getStatusIcon()}</Box>

        <Typography variant="h6" gutterBottom align="center">
          {getStatusText()}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{ mb: 2, height: 8, borderRadius: 4 }}
          color={progress.status === 'error' ? 'error' : progress.status === 'completed' ? 'success' : 'primary'}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            {formatBytes(progress.uploaded_bytes)} / {formatBytes(progress.total_bytes)}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {percentage}%
          </Typography>
        </Box>

        {progress.status === 'completed' && progress.video_id && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Video uploaded successfully!{' '}
            <Link href={`https://youtube.com/watch?v=${progress.video_id}`} target="_blank" rel="noopener noreferrer">
              View on YouTube
            </Link>
          </Alert>
        )}

        {progress.status === 'processing' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Your video is being processed by YouTube. This may take a few minutes.
          </Alert>
        )}

        {progress.status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Upload failed. Please try again.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
