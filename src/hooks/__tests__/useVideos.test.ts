import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVideos } from '../useVideos';
import { videoService } from '@/services/video.service';
import { mockVideo } from '@/test/mocks/mockData';

vi.mock('@/services/video.service');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteVideo', () => {
    it('should call deleteVideo service', async () => {
      vi.mocked(videoService.deleteVideo).mockResolvedValue();

      const { result } = renderHook(() => useVideos(), {
        wrapper: createWrapper(),
      });

      result.current.deleteVideo('123');

      await waitFor(() => {
        expect(videoService.deleteVideo).toHaveBeenCalledWith('123');
      });
    });

    it('should set isDeleting to true while deleting', async () => {
      vi.mocked(videoService.deleteVideo).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useVideos(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isDeleting).toBe(false);

      result.current.deleteVideo('123');

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true);
      });
    });
  });

  describe('updateVideo', () => {
    it('should update video with provided data', async () => {
      const updateData = { title: 'New Title', privacy_status: 'private' as const };
      vi.mocked(videoService.updateVideo).mockResolvedValue({
        ...mockVideo,
        ...updateData,
      });

      const { result } = renderHook(() => useVideos(), {
        wrapper: createWrapper(),
      });

      result.current.updateVideo({ videoId: '123', data: updateData });

      await waitFor(() => {
        expect(videoService.updateVideo).toHaveBeenCalledWith('123', updateData);
      });
    });
  });

  describe('scheduleVideo', () => {
    it('should schedule video with publish date', async () => {
      const scheduleData = { publish_at: '2026-02-01T12:00:00Z' };
      vi.mocked(videoService.scheduleVideo).mockResolvedValue();

      const { result } = renderHook(() => useVideos(), {
        wrapper: createWrapper(),
      });

      result.current.scheduleVideo({ videoId: '123', data: scheduleData });

      await waitFor(() => {
        expect(videoService.scheduleVideo).toHaveBeenCalledWith('123', scheduleData);
      });
    });
  });
});
