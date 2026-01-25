import { api } from './api';
import type {
  VideoSearchResult,
  SearchFilters,
  TrendingFilters,
  ChannelSearchResult,
} from '@/types/search.types';

export const searchService = {
  /**
   * Search for videos on YouTube
   */
  async searchVideos(filters: SearchFilters): Promise<VideoSearchResult[]> {
    const params = new URLSearchParams({
      query: filters.query,
      max_results: (filters.max_results || 25).toString(),
      order: filters.order || 'relevance',
    });
    const response = await api.get<{
      success: boolean;
      query: string;
      results: VideoSearchResult[];
      total_results: number;
    }>(`/api/youtube/search?${params}`);
    return response.data.results || [];
  },

  /**
   * Search for channels on YouTube
   */
  async searchChannels(query: string, maxResults = 25): Promise<ChannelSearchResult[]> {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
    });
    const response = await api.get<{ success: boolean; results: ChannelSearchResult[] }>(
      `/api/youtube/search-channels?${params}`
    );
    return response.data.results || [];
  },

  /**
   * Get trending videos
   */
  async getTrendingVideos(filters?: TrendingFilters): Promise<VideoSearchResult[]> {
    const params = new URLSearchParams();
    if (filters?.max_results) params.set('max_results', filters.max_results.toString());
    if (filters?.region_code) params.set('region_code', filters.region_code);
    if (filters?.category_id) params.set('category_id', filters.category_id);

    const response = await api.get<{
      success: boolean;
      results: VideoSearchResult[];
    }>(`/api/youtube/trending?${params}`);
    return response.data.results || [];
  },

  /**
   * Get related videos for a video
   */
  async getRelatedVideos(videoId: string, maxResults = 20): Promise<VideoSearchResult[]> {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
    });
    const response = await api.get<{
      success: boolean;
      related_to: string;
      results: VideoSearchResult[];
    }>(`/api/youtube/videos/${videoId}/related?${params}`);
    return response.data.results || [];
  },
};
