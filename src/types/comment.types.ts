/**
 * YouTube Comment Moderation Types
 *
 * Type definitions for YouTube comment entities and operations
 */

export interface YouTubeComment {
  comment_id: string;
  author_name: string;
  author_thumbnail_url?: string;
  text: string;
  like_count: number;
  published_at: string;
  reply_count: number;
  can_reply: boolean;
}

export interface ReplyToCommentRequest {
  text: string;
}
