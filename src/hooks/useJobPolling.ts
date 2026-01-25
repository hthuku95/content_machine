import { useQuery } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';
import type { JobFilters, ClippingJob } from '@/types/clipping.types';

/**
 * CRITICAL Hook: Real-time job polling
 *
 * This hook polls the jobs API every 5 seconds when there are active jobs.
 * It stops polling when all jobs are completed/failed to save resources.
 */
export function useJobPolling(filters?: JobFilters) {
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['clipping', 'jobs', 'polling', filters],
    queryFn: () => clippingService.listJobs(filters),
    // Enable polling every 5 seconds
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if no data or all jobs are completed/failed
      if (!data || data.length === 0) {
        return false;
      }

      const hasActiveJobs = data.some(
        (job: ClippingJob) => job.status === 'pending' || job.status === 'processing'
      );

      // Poll every 5 seconds if there are active jobs
      return hasActiveJobs ? 5000 : false;
    },
    refetchIntervalInBackground: false, // Don't poll when tab is in background
    staleTime: 0, // Always fetch fresh data
  });

  // Check if there are any active jobs
  const hasActiveJobs = jobs.some(
    (job) => job.status === 'pending' || job.status === 'processing'
  );

  return {
    jobs,
    isLoading,
    hasActiveJobs,
    isPolling: hasActiveJobs,
    refetch,
  };
}
