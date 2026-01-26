import { Box, Divider } from '@mui/material';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { DynamicBackground } from '@/components/common/DynamicBackground';

export function RegisterPage() {
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
      <RegisterForm />
      <Divider sx={{ my: 3, width: '100%', maxWidth: 400 }}>OR</Divider>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <GoogleOAuthButton text="Sign up with Google" />
      </Box>
    </Box>
    </>
  );
}
