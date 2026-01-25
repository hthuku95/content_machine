import { z } from 'zod';

// Video Management
export const updateVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  privacy_status: z.enum(['public', 'private', 'unlisted']),
  category_id: z.string().optional(),
  tags: z.array(z.string()).max(500, 'Too many tags').optional(),
});

export const scheduleDateSchema = z.object({
  publish_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid datetime format',
  }),
});

export const generateThumbnailSchema = z.object({
  timestamp: z.number().min(0, 'Timestamp must be positive'),
  width: z.number().min(120).max(1920).optional(),
  height: z.number().min(90).max(1080).optional(),
});

// Playlist Management
export const createPlaylistSchema = z.object({
  channel_id: z.number().positive('Channel is required'),
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(5000).optional(),
  privacy_status: z.enum(['public', 'private', 'unlisted']),
});

export const updatePlaylistSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional(),
  privacy_status: z.enum(['public', 'private', 'unlisted']).optional(),
});

export const addVideoToPlaylistSchema = z.object({
  video_id: z.string().min(1, 'Video ID is required'),
  position: z.number().min(0).optional(),
});

// Comments
export const replyToCommentSchema = z.object({
  text: z.string().min(1, 'Reply cannot be empty').max(10000),
});

// Captions
export const uploadCaptionSchema = z.object({
  language: z.string().min(2, 'Language code required').max(10),
  caption_file: z.instanceof(File, { message: 'Caption file required' }),
  name: z.string().max(255).optional(),
});

// Upload (Resumable)
export const initiateUploadSchema = z.object({
  channel_id: z.number().positive('Channel is required'),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(5000).optional(),
  privacy_status: z.enum(['public', 'private', 'unlisted']),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  video_file: z.instanceof(File, { message: 'Video file required' }),
}).refine(data => data.video_file.size > 0, {
  message: 'Video file cannot be empty',
  path: ['video_file'],
});

// Search Filters
export const searchFiltersSchema = z.object({
  query: z.string().min(1, 'Search query required'),
  max_results: z.number().min(1).max(50).optional(),
  order: z.enum(['relevance', 'date', 'viewCount', 'rating']).optional(),
});

// Type exports for use in components
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type ScheduleDateInput = z.infer<typeof scheduleDateSchema>;
export type GenerateThumbnailInput = z.infer<typeof generateThumbnailSchema>;
export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
export type AddVideoToPlaylistInput = z.infer<typeof addVideoToPlaylistSchema>;
export type ReplyToCommentInput = z.infer<typeof replyToCommentSchema>;
export type UploadCaptionInput = z.infer<typeof uploadCaptionSchema>;
export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
