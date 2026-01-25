import { useQuery } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';

export function useJobDetail(jobId: string) {
  return useQuery({
    queryKey: ['clipping', 'jobs', jobId],
    queryFn: () => clippingService.getJobDetail(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 5 seconds if job is active
      const data = query.state.data;
      return data?.status === 'pending' || data?.status === 'processing'
        ? 5000
        : false;
    },
    staleTime: 0, // Always refetch for real-time updates
  });
}
