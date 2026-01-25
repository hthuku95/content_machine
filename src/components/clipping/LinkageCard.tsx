import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Switch,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import type { ChannelLinkage } from '@/types/clipping.types';

interface LinkageCardProps {
  linkage: ChannelLinkage;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onEdit: (linkage: ChannelLinkage) => void;
  onDelete: (id: string) => void;
}

export function LinkageCard({ linkage, onToggleActive, onEdit, onDelete }: LinkageCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3">
            Linkage
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={linkage.is_active ? 'Active' : 'Inactive'}
              color={linkage.is_active ? 'success' : 'default'}
              size="small"
            />
            <Switch
              checked={linkage.is_active}
              onChange={() => onToggleActive(linkage.id, linkage.is_active)}
              size="small"
            />
            <Tooltip title="Edit linkage">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(linkage)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete linkage">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(linkage.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Source
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {linkage.source_channel?.channel_title || 'Unknown'}
            </Typography>
          </Box>
          <ArrowForwardIcon color="action" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Destination
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {linkage.destination_channel_title || 'Unknown'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Clip Duration
            </Typography>
            <Typography variant="body2">
              {linkage.min_clip_duration_seconds}s - {linkage.max_clip_duration_seconds}s
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Clips per Video
            </Typography>
            <Typography variant="body2">{linkage.clips_per_video}</Typography>
          </Box>
          {linkage.stats && (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Clips Generated
                </Typography>
                <Typography variant="body2">{linkage.stats.clips_generated}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Clips Posted
                </Typography>
                <Typography variant="body2">{linkage.stats.clips_posted}</Typography>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
