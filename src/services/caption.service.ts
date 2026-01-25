import { api } from './api';
import type { Caption, UploadCaptionRequest } from '@/types/caption.types';

export const captionService = {
  /**
   * List captions for a video
   */
  async listCaptions(videoId: string): Promise<Caption[]> {
    const response = await api.get<{
      success: boolean;
      video_id: string;
      captions: Caption[];
    }>(`/api/youtube/videos/${videoId}/captions`);
    return response.data.captions || [];
  },

  /**
   * Upload caption file for a video
   */
  async uploadCaption(videoId: string, data: UploadCaptionRequest): Promise<void> {
    const formData = new FormData();
    formData.append('language', data.language);
    formData.append('caption_file', data.caption_file);
    if (data.name) formData.append('name', data.name);

    await api.post(`/api/youtube/videos/${videoId}/captions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Delete a caption
   */
  async deleteCaption(captionId: string): Promise<void> {
    await api.delete(`/api/youtube/captions/${captionId}`);
  },
};
