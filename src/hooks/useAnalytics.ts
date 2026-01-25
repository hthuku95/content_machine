import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import type { AnalyticsDateRange } from '@/types/analytics.types';

export function useVideoAnalytics(videoId: string, dateRange: AnalyticsDateRange) {
  return useQuery({
    queryKey: ['youtube', 'analytics', 'video', videoId, dateRange],
    queryFn: () => analyticsService.getVideoAnalytics(videoId, dateRange),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!videoId && !!dateRange.start_date && !!dateRange.end_date,
  });
}

export function useRealtimeStats(videoId: string, refetchInterval?: number) {
  return useQuery({
    queryKey: ['youtube', 'analytics', 'realtime', videoId],
    queryFn: () => analyticsService.getRealtimeStats(videoId),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: refetchInterval || 30000, // Default 30 seconds
    enabled: !!videoId,
  });
}

export function useChannelAnalytics(channelId: number, dateRange: AnalyticsDateRange) {
  return useQuery({
    queryKey: ['youtube', 'analytics', 'channel', channelId, dateRange],
    queryFn: () => analyticsService.getChannelAnalytics(channelId, dateRange),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!channelId && !!dateRange.start_date && !!dateRange.end_date,
  });
}
