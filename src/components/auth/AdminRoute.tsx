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

  return <>{children}</>;
}