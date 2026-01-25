/**
 * YouTube Video Management Types
 *
 * Type definitions for YouTube video entities and operations
 */

export interface YouTubeVideo {
  id: string;
  youtube_video_id: string;
  channel_id: number;
  title: string;
  description: string | null;
  privacy_status: 'public' | 'private' | 'unlisted';
  category_id: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  duration: number | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;
  uploaded_at: string;
}

export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  privacy_status?: 'public' | 'private' | 'unlisted';
  category_id?: string;
  tags?: string[];
}

export interface UploadThumbnailRequest {
  thumbnail: File;
}

export interface GenerateThumbnailRequest {
  timestamp: number;
  width?: number;
  height?: number;
}

export interface ScheduleVideoRequest {
  publish_at: string; // ISO datetime
}

export type VideoPrivacyStatus = 'public' | 'private' | 'unlisted';
