/**
 * YouTube Search & Discovery Types
 *
 * Type definitions for YouTube search operations
 */

export interface VideoSearchResult {
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_title: string;
  thumbnail_url: string;
  published_at: string;
}

export interface SearchFilters {
  query: string;
  max_results?: number;
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
}

export interface TrendingFilters {
  max_results?: number;
  region_code?: string;
  category_id?: string;
}

export interface ChannelSearchResult {
  channel_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  subscriber_count: string;
}
