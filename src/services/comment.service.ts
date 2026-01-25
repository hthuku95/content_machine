import { api } from './api';
import type { YouTubeComment, ReplyToCommentRequest } from '@/types/comment.types';

export const commentService = {
  /**
   * Get comments for a video
   */
  async getVideoComments(videoId: string, maxResults = 100): Promise<YouTubeComment[]> {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
    });
    const response = await api.get<{
      success: boolean;
      video_id: string;
      comments: YouTubeComment[];
      total: number;
    }>(`/api/youtube/videos/${videoId}/comments?${params}`);
    return response.data.comments || [];
  },

  /**
   * Reply to a comment
   */
  async replyToComment(commentId: string, data: ReplyToCommentRequest): Promise<void> {
    await api.post(`/api/youtube/comments/${commentId}/reply`, data);
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/api/youtube/comments/${commentId}`);
  },
};
