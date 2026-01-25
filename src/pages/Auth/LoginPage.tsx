import { Box, Divider } from '@mui/material';
import { LoginForm } from '@/components/auth/LoginForm';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

export function LoginPage() {
  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <LoginForm />
      <Divider sx={{ my: 3, width: '100%', maxWidth: 400 }}>OR</Divider>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <GoogleOAuthButton />
      </Box>
    </Box>
  );
}
