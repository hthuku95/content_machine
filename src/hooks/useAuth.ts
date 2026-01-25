import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { PATHS } from '@/routes/paths';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user, isAuthenticated, setAuth, clearAuth, setLoading } = useAuthStore();

  // Verify token on mount
  const { data: verifyData, isLoading: isVerifying } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: authService.verify,
    enabled: !!token && !isAuthenticated,
    retry: false,
    staleTime: Infinity,
  });

  // Update auth state when verification succeeds
  useEffect(() => {
    if (verifyData?.user) {
      setAuth(token!, verifyData.user);
    }
    setLoading(false);
  }, [verifyData, token, setAuth, setLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Login successful!');
      navigate(PATHS.DASHBOARD);
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Registration successful!');
      navigate(PATHS.DASHBOARD);
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Logout function
  const logout = () => {
    authService.logout();
    clearAuth();
    queryClient.clear();
    toast.success('Logged out successfully');
    navigate(PATHS.LOGIN);
  };

  // Google OAuth function
  const loginWithGoogle = (redirectTo?: string) => {
    authService.initiateGoogleOAuth(redirectTo);
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading: isVerifying,

    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginWithGoogle,

    // Mutation states
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
