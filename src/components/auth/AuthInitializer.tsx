import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer component that verifies stored tokens on app load
 * and initializes the authentication state properly.
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const { token, isAuthenticated, setAuth, setLoading, clearAuth } = useAuthStore();

  // Verify token if it exists but user is not authenticated yet
  const { data: verifyData, isError, isLoading: isVerifying } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: authService.verify,
    enabled: !!token && !isAuthenticated,
    retry: false,
    staleTime: Infinity,
  });

  // Handle initialization and verification result
  useEffect(() => {
    // If no token at all, immediately set loading to false
    if (!token) {
      setLoading(false);
      return;
    }

    // If already authenticated, set loading to false
    if (isAuthenticated) {
      setLoading(false);
      return;
    }

    // If we have a token and are checking it
    if (token && !isAuthenticated) {
      // If verification succeeded
      if (verifyData?.user) {
        setAuth(token, verifyData.user);
        setLoading(false);
      }
      // If verification failed
      else if (isError) {
        clearAuth();
      }
      // If still verifying, keep loading true
      else if (!isVerifying) {
        // Query is not running and we have no data - shouldn't happen but handle it
        setLoading(false);
      }
    }
  }, [token, isAuthenticated, verifyData, isError, isVerifying, setAuth, setLoading, clearAuth]);

  return <>{children}</>;
}
