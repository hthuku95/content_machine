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
  Alert,
  AlertTitle,
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
  const [bulkReconnectDialogOpen, setBulkReconnectDialogOpen] = useState(false);

  const { channels, isLoading, disconnectChannel, connectChannel, isConnecting, isDisconnecting } =
    useConnectedChannels();

  console.log('[ConnectedChannelsPage] Channels loaded:', { count: channels.length, isLoading });

  // Calculate channels needing reauth
  const channelsNeedingReauth = channels.filter((ch) => ch.is_active && ch.requires_reauth);
  const hasReauthIssues = channelsNeedingReauth.length > 0;

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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasReauthIssues && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<RefreshIcon />}
              onClick={() => setBulkReconnectDialogOpen(true)}
            >
              Reconnect All ({channelsNeedingReauth.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={isConnecting ? <CircularProgress size={20} /> : <AddIcon />}
            onClick={() => {
              console.log('[ConnectedChannelsPage] Action: Connect new channel');
              connectChannel(undefined);
            }}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Channel'}
          </Button>
        </Box>
      </Box>

      {hasReauthIssues && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>
            {channelsNeedingReauth.length} Channel{channelsNeedingReauth.length !== 1 ? 's' : ''} Need
            Reconnection
          </AlertTitle>
          These channels cannot upload videos until reconnected. Click "Reconnect All" to fix all channels at
          once, or use the individual "Reconnect" buttons below.
        </Alert>
      )}

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
            onClick={() => connectChannel(undefined)}
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
                          connectChannel(undefined);
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

      <Dialog open={bulkReconnectDialogOpen} onClose={() => setBulkReconnectDialogOpen(false)}>
        <DialogTitle>Reconnect All Channels</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to reconnect {channelsNeedingReauth.length} channel
            {channelsNeedingReauth.length !== 1 ? 's' : ''} that need authorization.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            This will open Google's OAuth flow. You'll need to grant permissions for each channel individually.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
            Channels to reconnect:
          </DialogContentText>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            {channelsNeedingReauth.slice(0, 5).map((ch) => (
              <Box component="li" key={ch.id} sx={{ mb: 0.5 }}>
                <Typography variant="body2">{ch.channel_name}</Typography>
              </Box>
            ))}
            {channelsNeedingReauth.length > 5 && (
              <Box component="li" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                <Typography variant="body2">
                  ...and {channelsNeedingReauth.length - 5} more
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkReconnectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              console.log('[ConnectedChannelsPage] Action: Bulk reconnect');
              connectChannel(undefined);
              setBulkReconnectDialogOpen(false);
            }}
            variant="contained"
            color="warning"
            startIcon={<RefreshIcon />}
          >
            Start Reconnection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
