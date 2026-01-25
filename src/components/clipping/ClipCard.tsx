import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Link as MuiLink,
  CardActionArea,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import type { ExtractedClip, UploadStatus } from '@/types/clipping.types';
import { PATHS } from '@/routes/paths';
import { format } from 'date-fns';

interface ClipCardProps {
  clip: ExtractedClip;
  onRepost?: (id: string) => void;
}

const STATUS_COLORS: Record<UploadStatus, 'default' | 'primary' | 'success' | 'error'> = {
  pending: 'default',
  uploading: 'primary',
  uploaded: 'success',
  failed: 'error',
};

export function ClipCard({ clip, onRepost }: ClipCardProps) {
  const canRepost = clip.upload_status === 'failed';

  const handleRepostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRepost) {
      onRepost(clip.id);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={RouterLink}
        to={PATHS.CLIPPING.CLIP_DETAILS(clip.id)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {clip.thumbnail_url && (
          <CardMedia
            component="img"
            height="180"
            image={clip.thumbnail_url}
            alt={clip.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
        <Box sx={{ mb: 1 }}>
          <Chip
            label={clip.upload_status.toUpperCase()}
            color={STATUS_COLORS[clip.upload_status]}
            size="small"
            sx={{ mb: 1 }}
          />
          <Chip
            label={`${clip.duration_seconds}s`}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {clip.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {clip.description}
        </Typography>

        {clip.upload_status === 'uploaded' && (
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Views: {clip.views_count.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Likes: {clip.likes_count.toLocaleString()}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Created {format(new Date(clip.created_at), 'MMM d, yyyy')}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {clip.youtube_url && (
            <MuiLink
              href={clip.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <OpenInNewIcon fontSize="small" sx={{ mr: 0.5 }} />
              Watch on YouTube
            </MuiLink>
          )}
          {canRepost && onRepost && (
            <IconButton size="small" onClick={handleRepostClick} title="Repost">
              <ReplayIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
      </CardActionArea>
    </Card>
  );
}
