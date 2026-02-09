import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  YouTube as YouTubeIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useConnectedChannels } from '@/hooks/useConnectedChannels';
import { format } from 'date-fns';

export function ConnectedChannelsPage() {
  console.log('[ConnectedChannelsPage] Component mounted');

  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [channelToDisconnect, setChannelToDisconnect] = useState<number | null>(null);

  const { channels, isLoading, disconnectChannel, connectChannel, isConnecting, isDisconnecting } =
    useConnectedChannels();

  console.log('[ConnectedChannelsPage] Channels loaded:', { count: channels.length, isLoading });

  const handleDisconnectClick = (id: number) => {
    console.log('[ConnectedChannelsPage] Action: Disconnect channel', id);
    setChannelToDisconnect(id);
    setDisconnectDialogOpen(true);
    console.log('[ConnectedChannelsPage] State updated: Disconnect dialog opened');
  };

  const handleDisconnectConfirm = () => {
    if (channelToDisconnect) {
      console.log('[ConnectedChannelsPage] Action: Confirm disconnect', channelToDisconnect);
      disconnectChannel(channelToDisconnect);
      setDisconnectDialogOpen(false);
      setChannelToDisconnect(null);
      console.log('[ConnectedChannelsPage] State updated: Disconnect dialog closed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Connected YouTube Channels
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your connected YouTube channels for uploading clips
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={isConnecting ? <CircularProgress size={20} /> : <AddIcon />}
          onClick={() => {
            console.log('[ConnectedChannelsPage] Action: Connect new channel');
            connectChannel();
          }}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Channel'}
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : channels.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
          <YouTubeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Connected Channels
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Connect a YouTube channel to start uploading clips
          </Typography>
          <Button
            variant="contained"
            startIcon={isConnecting ? <CircularProgress size={20} /> : <AddIcon />}
            onClick={() => connectChannel()}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Channel'}
          </Button>
        </Paper>
      ) : (
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3 }}>
          {channels.map((channel) => {
            const needsReauth = channel.requires_reauth || false;
            const isActive = channel.is_active !== false;

            return (
              <Card
                key={channel.id}
                sx={{
                  borderLeft: needsReauth ? '4px solid' : undefined,
                  borderColor: needsReauth ? 'error.main' : undefined,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      src={channel.channel_thumbnail_url || undefined}
                      alt={channel.channel_name}
                      sx={{ width: 56, height: 56 }}
                    >
                      <YouTubeIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                          {channel.channel_name}
                        </Typography>
                        {needsReauth ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: 'error.main',
                              color: 'error.contrastText',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <WarningIcon sx={{ fontSize: 14 }} />
                            Expired
                          </Box>
                        ) : isActive ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: 'success.main',
                              color: 'success.contrastText',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 14 }} />
                            Connected
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              bgcolor: 'grey.600',
                              color: 'white',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            Inactive
                          </Box>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Connected {format(new Date(channel.connected_at), 'MMM d, yyyy')}
                      </Typography>
                      {needsReauth && channel.reauth_reason && (
                        <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                          ⚠️ {channel.reauth_reason}
                        </Typography>
                      )}
                    </Box>
                    {needsReauth ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                          console.log('[ConnectedChannelsPage] Action: Reconnect channel');
                          connectChannel();
                        }}
                        sx={{ minWidth: 'auto' }}
                      >
                        Reconnect
                      </Button>
                    ) : (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDisconnectClick(channel.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </ResponsiveGrid>
      )}

      <Dialog open={disconnectDialogOpen} onClose={() => setDisconnectDialogOpen(false)}>
        <DialogTitle>Disconnect Channel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disconnect this YouTube channel?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: 'warning.main', fontWeight: 'bold' }}>
            ⚠️ Warning: This will also delete all clipping linkages for this channel.
          </DialogContentText>
          <DialogContentText sx={{ mt: 1, fontSize: '0.875rem' }}>
            Note: If you just need to refresh the connection, use the "Reconnect" button instead, which preserves all linkages.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisconnectDialogOpen(false)} disabled={isDisconnecting}>
            Cancel
          </Button>
          <Button onClick={handleDisconnectConfirm} color="error" disabled={isDisconnecting}>
            {isDisconnecting ? <CircularProgress size={20} /> : 'Disconnect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
