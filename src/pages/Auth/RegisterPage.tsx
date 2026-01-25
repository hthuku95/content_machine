import { Box, Divider } from '@mui/material';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

export function RegisterPage() {
  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <RegisterForm />
      <Divider sx={{ my: 3, width: '100%', maxWidth: 400 }}>OR</Divider>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <GoogleOAuthButton text="Sign up with Google" />
      </Box>
    </Box>
  );
}
