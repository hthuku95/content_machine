import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/search.service';
import type { SearchFilters, TrendingFilters } from '@/types/search.types';

export function useVideoSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['youtube', 'search', 'videos', filters],
    queryFn: () => searchService.searchVideos(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!filters.query && filters.query.length > 0,
  });
}

export function useChannelSearch(query: string, maxResults?: number) {
  return useQuery({
    queryKey: ['youtube', 'search', 'channels', query, maxResults],
    queryFn: () => searchService.searchChannels(query, maxResults),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!query && query.length > 0,
  });
}

export function useTrendingVideos(filters?: TrendingFilters) {
  return useQuery({
    queryKey: ['youtube', 'trending', filters],
    queryFn: () => searchService.getTrendingVideos(filters),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useRelatedVideos(videoId: string, maxResults?: number) {
  return useQuery({
    queryKey: ['youtube', 'related', videoId, maxResults],
    queryFn: () => searchService.getRelatedVideos(videoId, maxResults),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!videoId,
  });
}
