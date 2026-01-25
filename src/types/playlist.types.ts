/**
 * YouTube Playlist Management Types
 *
 * Type definitions for YouTube playlist entities and operations
 */

export interface YouTubePlaylist {
  id: string;
  youtube_playlist_id: string;
  channel_id: number;
  channel_name: string;
  title: string;
  description: string | null;
  privacy_status: 'public' | 'private' | 'unlisted';
  video_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaylistRequest {
  channel_id: number;
  title: string;
  description?: string;
  privacy_status: 'public' | 'private' | 'unlisted';
}

export interface UpdatePlaylistRequest {
  title?: string;
  description?: string;
  privacy_status?: 'public' | 'private' | 'unlisted';
}

export interface AddVideoToPlaylistRequest {
  video_id: string;
  position?: number;
}
