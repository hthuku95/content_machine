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
import type { RegisterRequest } from '@/types/auth.types';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser, isRegisterLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerUser(registerData as RegisterRequest);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Sign Up
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Create your Content Machine account
      </Typography>

      <TextField
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isRegisterLoading}
      />

      <TextField
        {...register('username')}
        label="Username"
        fullWidth
        margin="normal"
        error={!!errors.username}
        helperText={errors.username?.message}
        disabled={isRegisterLoading}
      />

      <TextField
        {...register('password')}
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isRegisterLoading}
      />

      <TextField
        {...register('confirmPassword')}
        label="Confirm Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isRegisterLoading}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isRegisterLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isRegisterLoading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <MuiLink component={Link} to={PATHS.LOGIN} underline="hover">
            Sign in
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
