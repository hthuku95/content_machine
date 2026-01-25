import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { captionService } from '@/services/caption.service';
import type { UploadCaptionRequest } from '@/types/caption.types';
import toast from 'react-hot-toast';

export function useCaptions(videoId: string) {
  return useQuery({
    queryKey: ['youtube', 'captions', videoId],
    queryFn: () => captionService.listCaptions(videoId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!videoId,
  });
}

export function useCaptionActions(videoId: string) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: UploadCaptionRequest) =>
      captionService.uploadCaption(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'captions', videoId] });
      toast.success('Caption uploaded successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (captionId: string) => captionService.deleteCaption(captionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'captions', videoId] });
      toast.success('Caption deleted successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  return {
    uploadCaption: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteCaption: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
