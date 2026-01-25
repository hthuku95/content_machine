import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';
import type { ClipFilters } from '@/types/clipping.types';
import toast from 'react-hot-toast';

const CLIPS_PER_PAGE = 12;

export function useClips(filters?: ClipFilters) {
  const queryClient = useQueryClient();

  // Infinite query for clips with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['clipping', 'clips', filters],
    queryFn: ({ pageParam = 0 }) =>
      clippingService.listClips({
        ...filters,
        limit: CLIPS_PER_PAGE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < CLIPS_PER_PAGE) {
        return undefined;
      }
      return allPages.length * CLIPS_PER_PAGE;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Flatten pages into single array
  const clips = data?.pages.flat() || [];

  // Mutation for reposting a clip
  const repostMutation = useMutation({
    mutationFn: (id: string) => clippingService.repostClip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'clips'] });
      toast.success('Clip reposted successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  return {
    clips,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    repostClip: repostMutation.mutate,
    isReposting: repostMutation.isPending,
  };
}
