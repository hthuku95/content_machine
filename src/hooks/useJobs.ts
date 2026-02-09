import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';
import type { JobFilters } from '@/types/clipping.types';
import toast from 'react-hot-toast';

export function useJobs(filters?: JobFilters) {
  const queryClient = useQueryClient();

  // Query for listing jobs
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['clipping', 'jobs', filters],
    queryFn: () => clippingService.listJobs(filters),
    staleTime: 1000 * 30, // 30 seconds (shorter because of real-time updates)
  });

  // Mutation for canceling a job
  const cancelMutation = useMutation({
    mutationFn: (id: string) => clippingService.cancelJob(id),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'jobs'] });
      toast.success('Job cancelled');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Mutation for retrying a failed job
  const retryMutation = useMutation({
    mutationFn: (id: string) => clippingService.retryJob(id),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'jobs'] });
      toast.success('Job queued for retry');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  return {
    jobs,
    isLoading,
    error,
    cancelJob: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    retryJob: retryMutation.mutate,
    isRetrying: retryMutation.isPending,
  };
}
