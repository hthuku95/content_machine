import { api } from './api';
import type {
  YouTubeVideo,
  UpdateVideoRequest,
  GenerateThumbnailRequest,
  ScheduleVideoRequest,
} from '@/types/video.types';

type RawYouTubeVideo = Omit<
  Partial<YouTubeVideo>,
  'id' | 'channel_id' | 'view_count' | 'like_count' | 'comment_count' | 'tags'
> & {
  id?: string | number | null;
  channel_id?: string | number | null;
  view_count?: string | number | null;
  like_count?: string | number | null;
  comment_count?: string | number | null;
  tags?: string[] | string | null;
  video_title?: string;
  video_description?: string | null;
  custom_thumbnail_path?: string | null;
  youtube_url?: string | null;
  url?: string | null;
};

function asString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function normalizeVideo(raw: RawYouTubeVideo | null | undefined, index: number): YouTubeVideo {
  const source = raw || {};
  const rawId = asString(source.id);
  const explicitYoutubeId = asString(source.youtube_video_id);
  const youtubeId = explicitYoutubeId || rawId.replace(/^yt:/, '');
  const fallbackId = youtubeId || rawId || `upload-${index}`;
  const title = source.title || source.video_title || 'Untitled video';
  const thumbnailUrl =
    source.thumbnail_url ||
    source.custom_thumbnail_path ||
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null);

  return {
    id: fallbackId,
    youtube_video_id: youtubeId,
    channel_id: Number(source.channel_id || 0),
    title,
    description: source.description ?? source.video_description ?? null,
    privacy_status: source.privacy_status || 'private',
    category_id: source.category_id || null,
    tags: Array.isArray(source.tags) ? source.tags : null,
    thumbnail_url: thumbnailUrl,
    duration: source.duration || null,
    view_count: Number(source.view_count || 0),
    like_count: Number(source.like_count || 0),
    comment_count: Number(source.comment_count || 0),
    published_at: source.published_at || source.uploaded_at || '',
    uploaded_at: source.uploaded_at || source.published_at || '',
  };
}

export const videoService = {
  /**
   * List all uploaded videos
   */
  async listUploads(): Promise<YouTubeVideo[]> {
    const response = await api.get<{ success: boolean; uploads: Array<RawYouTubeVideo | null> | null }>(
      '/api/youtube/uploads'
    );
    return (response.data.uploads || []).map((upload, index) => normalizeVideo(upload, index));
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
