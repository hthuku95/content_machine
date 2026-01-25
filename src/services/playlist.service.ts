import { api } from './api';
import type {
  YouTubePlaylist,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  AddVideoToPlaylistRequest,
} from '@/types/playlist.types';

export const playlistService = {
  /**
   * List all playlists for the user
   */
  async listPlaylists(): Promise<YouTubePlaylist[]> {
    const response = await api.get<{ success: boolean; playlists: YouTubePlaylist[] }>(
      '/api/youtube/playlists'
    );
    return response.data.playlists || [];
  },

  /**
   * Create a new playlist
   */
  async createPlaylist(data: CreatePlaylistRequest): Promise<YouTubePlaylist> {
    const response = await api.post<{ success: boolean; playlist: YouTubePlaylist }>(
      '/api/youtube/playlists',
      data
    );
    return response.data.playlist;
  },

  /**
   * Update playlist metadata
   */
  async updatePlaylist(id: string, data: UpdatePlaylistRequest): Promise<YouTubePlaylist> {
    const response = await api.patch<{ success: boolean; playlist: YouTubePlaylist }>(
      `/api/youtube/playlists/${id}`,
      data
    );
    return response.data.playlist;
  },

  /**
   * Delete a playlist
   */
  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/api/youtube/playlists/${id}`);
  },

  /**
   * Add video to playlist
   */
  async addVideoToPlaylist(playlistId: string, data: AddVideoToPlaylistRequest): Promise<void> {
    await api.post(`/api/youtube/playlists/${playlistId}/videos`, data);
  },

  /**
   * Remove video from playlist
   */
  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    await api.delete(`/api/youtube/playlists/${playlistId}/videos/${videoId}`);
  },
};
