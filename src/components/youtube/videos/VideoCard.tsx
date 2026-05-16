import { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import type { YouTubeVideo, VideoPrivacyStatus } from '@/types/video.types';

export interface VideoCardProps {
  video: YouTubeVideo;
  onEdit: (video: YouTubeVideo) => void;
  onDelete: (videoId: string) => void;
  onSchedule: (video: YouTubeVideo) => void;
}

const PRIVACY_COLORS: Record<VideoPrivacyStatus, 'default' | 'success' | 'warning'> = {
  public: 'success',
  unlisted: 'warning',
  private: 'default',
};

function formatNumber(num?: number | null): string {
  const value = typeof num === 'number' && Number.isFinite(num) ? num : 0;

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function VideoCard({ video, onEdit, onDelete, onSchedule }: VideoCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const title = video.title || 'Untitled video';
  const privacyStatus = video.privacy_status || 'private';
  const uploadedAt = video.uploaded_at || video.published_at;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={video.thumbnail_url || '/placeholder-video.png'}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          label={privacyStatus.toUpperCase()}
          size="small"
          color={PRIVACY_COLORS[privacyStatus]}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap title={title}>
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.description || 'No description'}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VisibilityIcon fontSize="small" color="action" />
            <Typography variant="caption">{formatNumber(video.view_count)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThumbUpIcon fontSize="small" color="action" />
            <Typography variant="caption">{formatNumber(video.like_count)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CommentIcon fontSize="small" color="action" />
            <Typography variant="caption">{formatNumber(video.comment_count)}</Typography>
          </Box>
        </Box>

        {uploadedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Uploaded {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
          </Typography>
        )}
      </CardContent>

      <Divider />
      <CardActions>
        <Button
          size="small"
          component="a"
          href={`https://youtube.com/watch?v=${video.youtube_video_id}`}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<OpenInNewIcon />}
        >
          Watch
        </Button>
        <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(video)}>
          Edit
        </Button>
        <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem
            onClick={() => {
              onSchedule(video);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <ScheduleIcon fontSize="small" />
            </ListItemIcon>
            Schedule
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDelete(video.id);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}
