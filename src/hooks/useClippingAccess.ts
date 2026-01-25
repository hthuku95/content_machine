import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { clippingService } from '@/services/clipping.service';
import { useClippingAccessStore } from '@/stores/clippingAccessStore';
import { useAuthStore } from '@/stores/authStore';

export function useClippingAccess() {
  const { isAuthenticated } = useAuthStore();
  const { hasAccess, shouldCheckAccess, setAccess } = useClippingAccessStore();

  const { data, isLoading } = useQuery({
    queryKey: ['clipping', 'access'],
    queryFn: clippingService.checkAccess,
    enabled: isAuthenticated && shouldCheckAccess(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setAccess(data.has_access);
    }
  }, [data, setAccess]);

  return {
    hasAccess: data?.has_access ?? hasAccess,
    isLoading,
  };
}
