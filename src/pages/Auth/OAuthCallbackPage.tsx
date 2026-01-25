import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { PATHS } from '@/routes/paths';
import toast from 'react-hot-toast';

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // After OAuth, the backend sets the token in localStorage
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const { setAuth } = useAuthStore.getState();
        setAuth(token, user);
        toast.success('Successfully signed in with Google!');
        navigate(PATHS.DASHBOARD);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Authentication failed');
        navigate(PATHS.LOGIN);
      }
    } else {
      toast.error('Authentication failed');
      navigate(PATHS.LOGIN);
    }

    setLoading(false);
  }, [navigate, setLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1">Completing sign in...</Typography>
    </Box>
  );
}
