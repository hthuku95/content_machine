import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlaylistPlay as PlaylistPlayIcon,
} from '@mui/icons-material';
import type { YouTubePlaylist } from '@/types/playlist.types';

export interface PlaylistCardProps {
  playlist: YouTubePlaylist;
  onEdit: (playlist: YouTubePlaylist) => void;
  onDelete: (playlistId: string) => void;
  onAddVideo: (playlist: YouTubePlaylist) => void;
}

const PRIVACY_COLORS: Record<string, 'default' | 'success' | 'warning'> = {
  public: 'success',
  unlisted: 'warning',
  private: 'default',
};

export function PlaylistCard({ playlist, onEdit, onDelete, onAddVideo }: PlaylistCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" noWrap sx={{ flex: 1, mr: 1 }} title={playlist.title}>
            {playlist.title}
          </Typography>
          <Chip
            label={playlist.privacy_status.toUpperCase()}
            size="small"
            color={PRIVACY_COLORS[playlist.privacy_status]}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {playlist.description || 'No description'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PlaylistPlayIcon color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {playlist.video_count} {playlist.video_count === 1 ? 'video' : 'videos'}
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Channel: {playlist.channel_name}
        </Typography>
      </CardContent>

      <Divider />
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button size="small" startIcon={<AddIcon />} onClick={() => onAddVideo(playlist)}>
          Add Video
        </Button>
        <Box>
          <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(playlist)}>
            Edit
          </Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(playlist.id)}>
            Delete
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
