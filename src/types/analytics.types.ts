/**
 * YouTube Analytics Types
 *
 * Type definitions for YouTube analytics data and operations
 */

export interface VideoAnalytics {
  video_id: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    views: number;
    watch_time_minutes: number;
    average_view_duration: number;
    average_view_percentage: number;
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
    subscribers_gained: number;
    subscribers_lost: number;
  };
}

export interface ChannelAnalytics {
  channel_id: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    views: number;
    watch_time_minutes: number;
    subscribers_gained: number;
    subscribers_lost: number;
  };
}

export interface RealtimeVideoStats {
  video_id: string;
  title: string;
  stats: {
    view_count: number;
    like_count: number;
    comment_count: number;
  };
}

export interface AnalyticsDateRange {
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
}
