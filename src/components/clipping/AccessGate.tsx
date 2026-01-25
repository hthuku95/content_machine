import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useClippingAccess } from '@/hooks/useClippingAccess';

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const { hasAccess, isLoading } = useClippingAccess();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!hasAccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h5" component="h2" gutterBottom>
            YouTube Clipping Access Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have access to the YouTube clipping feature yet. This feature is currently
            in beta and only available to whitelisted users.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you believe you should have access, please contact support.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} disabled>
            Request Access (Coming Soon)
          </Button>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
}
