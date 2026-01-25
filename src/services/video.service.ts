import { api } from './api';
import type {
  YouTubeVideo,
  UpdateVideoRequest,
  GenerateThumbnailRequest,
  ScheduleVideoRequest,
} from '@/types/video.types';

export const videoService = {
  /**
   * List all uploaded videos
   */
  async listUploads(): Promise<YouTubeVideo[]> {
    const response = await api.get<{ success: boolean; uploads: YouTubeVideo[] }>(
      '/api/youtube/uploads'
    );
    return response.data.uploads || [];
  },

  /**
   * Delete video from YouTube
   */
  async deleteVideo(videoId: string): Promise<void> {
    await api.delete<{ success: boolean; message: string }>(
      `/api/youtube/videos/${videoId}`
    );
  },

  /**
   * Update video metadata
   */
  async updateVideo(videoId: string, data: UpdateVideoRequest): Promise<YouTubeVideo> {
    const response = await api.patch<{ success: boolean; video: YouTubeVideo }>(
      `/api/youtube/videos/${videoId}`,
      data
    );
    return response.data.video;
  },

  /**
   * Upload custom thumbnail
   */
  async uploadThumbnail(videoId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    await api.post<{ success: boolean; message: string }>(
      `/api/youtube/videos/${videoId}/thumbnail`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  /**
   * Generate thumbnail from video frame
   */
  async generateThumbnail(
    videoId: string,
    data: GenerateThumbnailRequest
  ): Promise<void> {
    await api.post<{ success: boolean; message: string }>(
      `/api/youtube/videos/${videoId}/thumbnail/generate`,
      data
    );
  },

  /**
   * Schedule video publication
   */
  async scheduleVideo(videoId: string, data: ScheduleVideoRequest): Promise<void> {
    await api.post<{ success: boolean; message: string }>(
      `/api/youtube/videos/${videoId}/schedule`,
      data
    );
  },
};
