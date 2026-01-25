import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PATHS } from '@/routes/paths';
import type { LoginRequest } from '@/types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginForm() {
  const { login, isLoginLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginRequest) => {
    login(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Sign In
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Welcome back to Content Machine
      </Typography>

      <TextField
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoginLoading}
      />

      <TextField
        {...register('password')}
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoginLoading}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isLoginLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoginLoading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <MuiLink component={Link} to={PATHS.REGISTER} underline="hover">
            Sign up
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
