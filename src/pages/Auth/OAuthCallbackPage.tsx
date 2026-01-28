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
    // Read token and user from URL hash (passed by backend after OAuth)
    const hash = window.location.hash.substring(1); // Remove the '#'
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        const { setAuth } = useAuthStore.getState();

        // Store in localStorage for persistence
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        setAuth(token, user);
        toast.success('Successfully signed in with Google!');

        // Clear the hash from URL before navigating
        window.location.hash = '';
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
