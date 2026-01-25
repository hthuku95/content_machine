import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videoService } from '@/services/video.service';
import type { UpdateVideoRequest, GenerateThumbnailRequest, ScheduleVideoRequest } from '@/types/video.types';
import toast from 'react-hot-toast';

export function useVideos() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (videoId: string) => videoService.deleteVideo(videoId),
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'uploads'] });
      toast.success('Video deleted successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: UpdateVideoRequest }) =>
      videoService.updateVideo(videoId, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'uploads'] });
      toast.success('Video updated successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const uploadThumbnailMutation = useMutation({
    mutationFn: ({ videoId, file }: { videoId: string; file: File }) =>
      videoService.uploadThumbnail(videoId, file),
    onSuccess: () => {
      toast.success('Thumbnail uploaded successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const generateThumbnailMutation = useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: GenerateThumbnailRequest }) =>
      videoService.generateThumbnail(videoId, data),
    onSuccess: () => {
      toast.success('Thumbnail generated successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: ScheduleVideoRequest }) =>
      videoService.scheduleVideo(videoId, data),
    onSuccess: () => {
      toast.success('Video scheduled successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  return {
    deleteVideo: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    updateVideo: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    uploadThumbnail: uploadThumbnailMutation.mutate,
    isUploadingThumbnail: uploadThumbnailMutation.isPending,
    generateThumbnail: generateThumbnailMutation.mutate,
    isGeneratingThumbnail: generateThumbnailMutation.isPending,
    scheduleVideo: scheduleMutation.mutate,
    isScheduling: scheduleMutation.isPending,
  };
}
