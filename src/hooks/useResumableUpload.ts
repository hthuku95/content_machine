import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumableUploadService } from '@/services/resumable-upload.service';
import type { InitiateResumableUploadRequest } from '@/types/upload.types';
import toast from 'react-hot-toast';

export function useResumableUpload() {
  console.log('[useResumableUpload] Hook initialized');
  const queryClient = useQueryClient();

  const initiateMutation = useMutation({
    mutationFn: (data: InitiateResumableUploadRequest) => {
      console.log('[useResumableUpload] Initiating upload with data:', data);
      return resumableUploadService.initiateUpload(data);
    },
    onSuccess: (data) => {
      console.log('[useResumableUpload] Upload session initiated successfully:', data);
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
      console.log('[useResumableUpload] Uploading chunk:', {
        uploadId,
        startByte,
        endByte,
        chunkSize: chunk.size,
        totalBytes,
        percentage: ((endByte / totalBytes) * 100).toFixed(2) + '%',
      });
      return resumableUploadService.uploadChunk(uploadId, chunk, startByte, endByte, totalBytes);
    },
    onSuccess: (data) => {
      console.log('[useResumableUpload] Chunk uploaded successfully:', data);
    },
    onError: (error) => {
      console.error('[useResumableUpload] Failed to upload chunk:', error);
      // Error handled by interceptor
    },
  });

  const completeUpload = () => {
    console.log('[useResumableUpload] Completing upload, invalidating queries');
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
