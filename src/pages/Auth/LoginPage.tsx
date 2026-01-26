import { Box, Divider } from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { DynamicBackground } from '@/components/common/DynamicBackground';

export function LoginPage() {
  return (
    <>
      <DynamicBackground opacity={0.15} updateInterval={5} />
      <Box sx={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: { xs: 2, sm: 3 },
      py: { xs: 4, sm: 6 }
    }}>
      <LoginForm />
      <Divider sx={{ my: 3, width: '100%', maxWidth: 400 }}>OR</Divider>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <GoogleOAuthButton />
      </Box>
    </Box>
    </>
  );
}
