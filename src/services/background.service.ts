import api from './api';

export interface BackgroundInfo {
  cached: boolean;
  generated_at?: string;
  theme?: string;
  age_minutes?: number;
  next_refresh_minutes?: number;
  image_size_bytes?: number;
}

export const backgroundService = {
  /**
   * Fetches a dynamically generated background image from the backend
   * Returns a Blob that can be used to create an object URL
   */
  async getBackgroundImage(): Promise<Blob> {
    const response = await api.get('/api/background/image', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Gets information about the current cached background
   */
  async getBackgroundInfo(): Promise<BackgroundInfo> {
    const response = await api.get('/api/background/info');
    return response.data;
  },
};
