import { api } from './api';
import type {
  VideoAnalytics,
  ChannelAnalytics,
  RealtimeVideoStats,
  AnalyticsDateRange,
} from '@/types/analytics.types';

export const analyticsService = {
  /**
   * Get video analytics for a date range
   */
  async getVideoAnalytics(
    videoId: string,
    dateRange: AnalyticsDateRange
  ): Promise<VideoAnalytics> {
    const params = new URLSearchParams({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    });
    const response = await api.get<VideoAnalytics>(
      `/api/youtube/videos/${videoId}/analytics?${params}`
    );
    return response.data;
  },

  /**
   * Get realtime stats for a video
   */
  async getRealtimeStats(videoId: string): Promise<RealtimeVideoStats> {
    const response = await api.get<RealtimeVideoStats>(
      `/api/youtube/videos/${videoId}/analytics/realtime`
    );
    return response.data;
  },

  /**
   * Get channel analytics for a date range
   */
  async getChannelAnalytics(
    channelId: number,
    dateRange: AnalyticsDateRange
  ): Promise<ChannelAnalytics> {
    const params = new URLSearchParams({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    });
    const response = await api.get<ChannelAnalytics>(
      `/api/youtube/channels/${channelId}/analytics?${params}`
    );
    return response.data;
  },
};
