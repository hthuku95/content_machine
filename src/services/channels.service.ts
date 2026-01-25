import { api } from './api';
import type { ConnectedYouTubeChannel } from '@/types/channel.types';

export const channelsService = {
  /**
   * Get all connected YouTube channels for the user
   */
  async listConnectedChannels(): Promise<ConnectedYouTubeChannel[]> {
    const response = await api.get<{ success: boolean; channels: ConnectedYouTubeChannel[] }>('/api/youtube/channels');
    return response.data.channels || [];
  },

  /**
   * Disconnect a YouTube channel
   */
  async disconnectChannel(id: number): Promise<void> {
    await api.delete(`/api/youtube/channels/${id}/disconnect`);
  },

  /**
   * Initiate YouTube channel connection
   * Follows backend UI pattern: fetch OAuth URL, then redirect
   */
  async initiateConnection(redirectTo?: string): Promise<void> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (redirectTo) {
        params.set('redirect_to', redirectTo);
      }

      // Make API call to get Google OAuth URL (uses Authorization header from interceptor)
      const response = await api.get<{ success: boolean; auth_url: string; message: string }>(
        `/youtube/connect?${params.toString()}`
      );

      if (response.data.success && response.data.auth_url) {
        // Redirect to Google OAuth (user can select ANY Google account)
        console.log('🔐 Redirecting to Google OAuth for YouTube connection...');
        window.location.href = response.data.auth_url;
      } else {
        throw new Error(response.data.message || 'Failed to get OAuth URL');
      }
    } catch (error) {
      console.error('Failed to initiate YouTube connection:', error);
      throw error;
    }
  },

  /**
   * Refresh expired OAuth token for a channel
   */
  async refreshChannelToken(id: number): Promise<void> {
    await api.post<{ success: boolean; message: string }>(
      `/api/youtube/channels/${id}/refresh`
    );
  },
};
