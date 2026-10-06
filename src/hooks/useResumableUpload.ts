import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumableUploadService } from '@/services/resumable-upload.service';
import type { InitiateResumableUploadRequest } from '@/types/upload.types';
import toast from 'react-hot-toast';

export function useResumableUpload() {
  const queryClient = useQueryClient();

  const initiateMutation = useMutation({
    mutationFn: (data: InitiateResumableUploadRequest) => {
      return resumableUploadService.initiateUpload(data);
    },
    onSuccess: () => {
    },
    onError: (error) => {
      console.error('[useResumableUpload] Failed to initiate upload:', error);
      // Error handled by interceptor
    },
  });

  const uploadChunkMutation = useMutation({
    mutationFn: ({
      uploadId,
      chunk,
      startByte,
      endByte,
      totalBytes,
    }: {
      uploadId: number;
      chunk: Blob;
      startByte: number;
      endByte: number;
      totalBytes: number;
    }) => {
      return resumableUploadService.uploadChunk(uploadId, chunk, startByte, endByte, totalBytes);
    },
    onSuccess: () => {
    },
    onError: (error) => {
      console.error('[useResumableUpload] Failed to upload chunk:', error);
      // Error handled by interceptor
    },
  });

  const completeUpload = () => {
    queryClient.invalidateQueries({ queryKey: ['youtube', 'uploads'] });
    toast.success('Video uploaded successfully');
  };

  return {
    initiateUpload: initiateMutation.mutate,
    initiateUploadAsync: initiateMutation.mutateAsync,
    isInitiating: initiateMutation.isPending,
    uploadChunk: uploadChunkMutation.mutate,
    uploadChunkAsync: uploadChunkMutation.mutateAsync,
    isUploadingChunk: uploadChunkMutation.isPending,
    completeUpload,
  };
}
