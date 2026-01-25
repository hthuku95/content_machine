import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Switch,
  Chip,
  Link as MuiLink,
} from '@mui/material';
import { Delete as DeleteIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import type { SourceChannel } from '@/types/clipping.types';
import { format } from 'date-fns';

interface SourceChannelCardProps {
  channel: SourceChannel;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export function SourceChannelCard({
  channel,
  onToggleActive,
  onDelete,
}: SourceChannelCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {channel.channel_title}
            </Typography>
            <MuiLink
              href={channel.channel_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
            >
              View Channel <OpenInNewIcon fontSize="small" />
            </MuiLink>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={channel.is_active ? 'Active' : 'Inactive'}
              color={channel.is_active ? 'success' : 'default'}
              size="small"
            />
            <Switch
              checked={channel.is_active}
              onChange={() => onToggleActive(channel.id, channel.is_active)}
              size="small"
            />
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(channel.id)}
              aria-label="delete channel"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Channel ID: {channel.channel_id}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Added {format(new Date(channel.created_at), 'MMM d, yyyy')}
        </Typography>
      </CardContent>
    </Card>
  );
}
