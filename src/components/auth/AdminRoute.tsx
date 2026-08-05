import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { PATHS } from '@/routes/paths';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (!user?.is_staff && !user?.is_superuser) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          gap: 1.5,
          textAlign: 'center',
          px: 2,
        }}
      >
        <LockIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Admin access required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This area is restricted to staff and superuser accounts.
        </Typography>
        <Button variant="outlined" component="a" href={PATHS.DASHBOARD} sx={{ mt: 1 }}>
          Back to dashboard
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}