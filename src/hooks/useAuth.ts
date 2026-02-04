import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { PATHS } from '@/routes/paths';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useAuth() {
  console.log('[useAuth] Hook initialized');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user, isAuthenticated, setAuth, clearAuth, setLoading } = useAuthStore();

  console.log('[useAuth] Current auth state:', {
    hasToken: !!token,
    isAuthenticated,
    userId: user?.id,
    userEmail: user?.email
  });

  // Verify token on mount
  const { data: verifyData, isLoading: isVerifying } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: () => {
      console.log('[useAuth] Verifying token...');
      return authService.verify();
    },
    enabled: !!token && !isAuthenticated,
    retry: false,
    staleTime: Infinity,
  });

  // Update auth state when verification succeeds
  useEffect(() => {
    if (verifyData?.user) {
      console.log('[useAuth] Token verified successfully, user:', verifyData.user);
      setAuth(token!, verifyData.user);
    }
    setLoading(false);
  }, [verifyData, token, setAuth, setLoading]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => {
      console.log('[useAuth] Attempting login for user:', credentials.email);
      return authService.login(credentials);
    },
    onSuccess: (data) => {
      console.log('[useAuth] Login successful:', { user: data.user, hasToken: !!data.token });
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Login successful!');
      navigate(PATHS.DASHBOARD);
    },
    onError: (error) => {
      console.error('[useAuth] Login failed:', error);
      // Error handled by interceptor
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => {
      console.log('[useAuth] Attempting registration for user:', data.email);
      return authService.register(data);
    },
    onSuccess: (data) => {
      console.log('[useAuth] Registration successful:', { user: data.user, hasToken: !!data.token });
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Registration successful!');
      navigate(PATHS.DASHBOARD);
    },
    onError: (error) => {
      console.error('[useAuth] Registration failed:', error);
      // Error handled by interceptor
    },
  });

  // Logout function
  const logout = () => {
    console.log('[useAuth] User logging out');
    authService.logout();
    clearAuth();
    queryClient.clear();
    toast.success('Logged out successfully');
    navigate(PATHS.LOGIN);
  };

  // Google OAuth function
  const loginWithGoogle = (redirectTo?: string) => {
    console.log('[useAuth] Initiating Google OAuth login, redirect:', redirectTo);
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
