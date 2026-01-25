import { describe, it, expect, vi, beforeEach } from 'vitest';
import { videoService } from '../video.service';
import { api } from '../api';
import { mockVideo, mockVideos } from '@/test/mocks/mockData';

vi.mock('../api');

describe('videoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUploads', () => {
    it('should fetch and return list of uploaded videos', async () => {
      const mockResponse = {
        data: {
          success: true,
          uploads: mockVideos,
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await videoService.listUploads();

      expect(api.get).toHaveBeenCalledWith('/api/youtube/uploads');
      expect(result).toEqual(mockVideos);
    });

    it('should return empty array if uploads is null', async () => {
      const mockResponse = {
        data: {
          success: true,
          uploads: null,
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await videoService.listUploads();

      expect(result).toEqual([]);
    });
  });

  describe('deleteVideo', () => {
    it('should call DELETE endpoint with video ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Video deleted',
        },
      };

      vi.mocked(api.delete).mockResolvedValue(mockResponse);

      await videoService.deleteVideo('123');

      expect(api.delete).toHaveBeenCalledWith('/api/youtube/videos/123');
    });
  });

  describe('updateVideo', () => {
    it('should update video and return updated data', async () => {
      const updateData = {
        title: 'Updated Title',
        privacy_status: 'private' as const,
      };

      const mockResponse = {
        data: {
          success: true,
          video: { ...mockVideo, ...updateData },
        },
      };

      vi.mocked(api.patch).mockResolvedValue(mockResponse);

      const result = await videoService.updateVideo('123', updateData);

      expect(api.patch).toHaveBeenCalledWith('/api/youtube/videos/123', updateData);
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('uploadThumbnail', () => {
    it('should upload thumbnail with FormData', async () => {
      const file = new File(['thumbnail'], 'thumb.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        data: {
          success: true,
          message: 'Thumbnail uploaded',
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      await videoService.uploadThumbnail('123', file);

      expect(api.post).toHaveBeenCalled();
      const callArgs = vi.mocked(api.post).mock.calls[0];
      expect(callArgs[0]).toBe('/api/youtube/videos/123/thumbnail');
      expect(callArgs[1]).toBeInstanceOf(FormData);
    });
  });

  describe('scheduleVideo', () => {
    it('should schedule video with datetime', async () => {
      const scheduleData = {
        publish_at: '2026-02-01T12:00:00Z',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Video scheduled',
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      await videoService.scheduleVideo('123', scheduleData);

      expect(api.post).toHaveBeenCalledWith(
        '/api/youtube/videos/123/schedule',
        scheduleData
      );
    });
  });
});
