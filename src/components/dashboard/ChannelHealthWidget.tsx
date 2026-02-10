import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material';
import { useConnectedChannels } from '@/hooks/useConnectedChannels';
import { PATHS } from '@/routes/paths';
import { formatDistanceToNow } from 'date-fns';

export function ChannelHealthWidget() {
  const { channels, isLoading, dataUpdatedAt } = useConnectedChannels();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={150}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const activeChannels = channels?.filter((ch) => ch.is_active) || [];
  const needsReauthChannels = activeChannels.filter((ch) => ch.requires_reauth);
  const healthyChannels = activeChannels.filter((ch) => !ch.requires_reauth);

  const hasIssues = needsReauthChannels.length > 0;
  const lastChecked = dataUpdatedAt
    ? formatDistanceToNow(dataUpdatedAt, { addSuffix: true })
    : 'Never';

  return (
    <Card
      sx={{
        border: hasIssues ? '2px solid' : '1px solid',
        borderColor: hasIssues ? 'warning.main' : 'divider',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            YouTube Channels Health
          </Typography>
          <ManageAccountsIcon color={hasIssues ? 'warning' : 'success'} />
        </Box>

        {hasIssues && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              {needsReauthChannels.length} channel{needsReauthChannels.length !== 1 ? 's' : ''} need
              reconnection
            </Typography>
            <Typography variant="caption">
              These channels cannot upload videos until reconnected
            </Typography>
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Health Summary */}
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              icon={<CheckCircleIcon />}
              label={`${healthyChannels.length} Healthy`}
              color="success"
              size="small"
              variant="outlined"
            />
            {needsReauthChannels.length > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={`${needsReauthChannels.length} Need Reconnection`}
                color="warning"
                size="small"
              />
            )}
          </Box>

          <Divider />

          {/* Status Details */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Active Channels: <strong>{activeChannels.length}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last checked: {lastChecked}
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              component={RouterLink}
              to={PATHS.CHANNELS.CONNECTED}
              variant={hasIssues ? 'contained' : 'outlined'}
              color={hasIssues ? 'warning' : 'primary'}
              size="small"
              startIcon={hasIssues ? <WarningIcon /> : <ManageAccountsIcon />}
            >
              {hasIssues ? 'Reconnect Channels' : 'Manage Channels'}
            </Button>

            {hasIssues && (
              <Button
                component={RouterLink}
                to={`${PATHS.CHANNELS.CONNECTED}?reconnectAll=true`}
                variant="text"
                color="warning"
                size="small"
                startIcon={<RefreshIcon />}
              >
                Reconnect All
              </Button>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
