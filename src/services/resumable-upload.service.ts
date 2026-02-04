import { api } from './api';
import type {
  InitiateResumableUploadRequest,
  ResumableUploadSession,
  UploadProgress,
} from '@/types/upload.types';

export const resumableUploadService = {
  /**
   * Initiate a resumable upload session
   */
  async initiateUpload(
    data: InitiateResumableUploadRequest
  ): Promise<ResumableUploadSession> {
    console.log('[ResumableUploadService] Initiating upload session:', data);
    const response = await api.post<{
      success: boolean;
      upload_id: number;
      session_url: string;
      total_bytes: number;
    }>('/api/youtube/upload/resumable', data);

    console.log('[ResumableUploadService] Upload session created:', response.data);
    return {
      upload_id: response.data.upload_id,
      session_url: response.data.session_url,
      total_bytes: response.data.total_bytes,
    };
  },

  /**
   * Upload a chunk of the video file
   */
  async uploadChunk(
    uploadId: number,
    chunk: Blob,
    startByte: number,
    endByte: number,
    totalBytes: number
  ): Promise<UploadProgress> {
    console.log('[ResumableUploadService] Uploading chunk:', {
      uploadId,
      startByte,
      endByte,
      chunkSize: chunk.size,
      totalBytes,
      contentRange: `bytes ${startByte}-${endByte}/${totalBytes}`,
    });

    const response = await api.put(
      `/api/youtube/upload/resumable/${uploadId}/chunk`,
      chunk,
      {
        headers: {
          'Content-Range': `bytes ${startByte}-${endByte}/${totalBytes}`,
          'Content-Type': 'application/octet-stream',
        },
      }
    );

    console.log('[ResumableUploadService] Chunk upload response:', response.data);
    return response.data;
  },
};
