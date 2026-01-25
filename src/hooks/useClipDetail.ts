import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';
import toast from 'react-hot-toast';

export function useClipDetail(clipId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['clipping', 'clips', clipId],
    queryFn: () => clippingService.getClipDetail(clipId),
    enabled: !!clipId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for reposting a clip
  const repostMutation = useMutation({
    mutationFn: () => clippingService.repostClip(clipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'clips', clipId] });
      queryClient.invalidateQueries({ queryKey: ['clipping', 'clips'] });
      toast.success('Clip reposted successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  return {
    ...query,
    repostClip: repostMutation.mutate,
    isReposting: repostMutation.isPending,
  };
}
