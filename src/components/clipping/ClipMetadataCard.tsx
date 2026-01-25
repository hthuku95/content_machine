import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as ViewsIcon,
  ThumbUp as LikesIcon,
  Comment as CommentsIcon,
  Timer as DurationIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import type { ExtractedClip, UploadStatus } from '@/types/clipping.types';
import { formatDistanceToNow } from 'date-fns';

interface ClipMetadataCardProps {
  clip: ExtractedClip;
}

const STATUS_COLORS: Record<UploadStatus, 'default' | 'primary' | 'success' | 'error'> = {
  pending: 'default',
  uploading: 'primary',
  uploaded: 'success',
  failed: 'error',
};

export function ClipMetadataCard({ clip }: ClipMetadataCardProps) {
  const engagementRate = clip.views_count > 0
    ? ((clip.likes_count / clip.views_count) * 100).toFixed(2)
    : '0.00';

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analytics & Metadata
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Upload Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Upload Status
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={clip.upload_status.toUpperCase()}
              color={STATUS_COLORS[clip.upload_status]}
              size="small"
            />
          </Box>
        </Box>

        {/* Analytics (only for uploaded clips) */}
        {clip.upload_status === 'uploaded' && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Performance
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ViewsIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {clip.views_count.toLocaleString()} views
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LikesIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {clip.likes_count.toLocaleString()} likes
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CommentsIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {clip.comments_count.toLocaleString()} comments
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Engagement Rate */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Engagement Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <TrendingIcon fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  {engagementRate}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                (likes / views)
              </Typography>
            </Box>
          </>
        )}

        {/* Duration */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Duration
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <DurationIcon fontSize="small" color="action" />
            <Typography variant="body2">{clip.duration_seconds} seconds</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Clip: {clip.start_time_seconds}s - {clip.end_time_seconds}s
          </Typography>
        </Box>

        {/* AI Metadata */}
        {clip.ai_confidence_score !== null && clip.ai_confidence_score !== undefined && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              AI Confidence Score
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  {(clip.ai_confidence_score * 100).toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={clip.ai_confidence_score * 100}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
          </Box>
        )}

        {/* Viral Factors */}
        {clip.viral_factors && clip.viral_factors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Viral Factors
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {clip.viral_factors.map((factor, index) => (
                <Chip key={index} label={factor} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {/* Tags */}
        {clip.tags && clip.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {clip.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Box>
        )}

        {/* Timestamps */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Created
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {formatDistanceToNow(new Date(clip.created_at), { addSuffix: true })}
          </Typography>

          {clip.uploaded_at && (
            <>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Uploaded
              </Typography>
              <Typography variant="body2">
                {formatDistanceToNow(new Date(clip.uploaded_at), { addSuffix: true })}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
