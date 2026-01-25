import type { YouTubeVideo } from '@/types/video.types';
import type { YouTubePlaylist } from '@/types/playlist.types';
import type { ConnectedYouTubeChannel } from '@/types/channel.types';
import type { YouTubeComment } from '@/types/comment.types';
import type { Caption } from '@/types/caption.types';

export const mockVideo: YouTubeVideo = {
  id: '1',
  youtube_video_id: 'abc123',
  channel_id: 1,
  title: 'Test Video',
  description: 'Test Description',
  privacy_status: 'public',
  category_id: '22',
  tags: ['test', 'video'],
  thumbnail_url: 'https://example.com/thumb.jpg',
  duration: 300,
  view_count: 1000,
  like_count: 50,
  comment_count: 10,
  published_at: '2026-01-01T00:00:00Z',
  uploaded_at: '2026-01-01T00:00:00Z',
};

export const mockVideos: YouTubeVideo[] = [
  mockVideo,
  {
    ...mockVideo,
    id: '2',
    youtube_video_id: 'def456',
    title: 'Test Video 2',
    privacy_status: 'private',
  },
];

export const mockPlaylist: YouTubePlaylist = {
  id: '1',
  youtube_playlist_id: 'PLabc123',
  channel_id: 1,
  channel_name: 'Test Channel',
  title: 'Test Playlist',
  description: 'Test playlist description',
  privacy_status: 'public',
  video_count: 5,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockPlaylists: YouTubePlaylist[] = [
  mockPlaylist,
  {
    ...mockPlaylist,
    id: '2',
    youtube_playlist_id: 'PLdef456',
    title: 'Test Playlist 2',
  },
];

export const mockChannel: ConnectedYouTubeChannel = {
  id: 1,
  youtube_channel_id: 'UCabc123',
  user_id: 1,
  channel_name: 'Test Channel',
  channel_thumbnail_url: 'https://example.com/channel.jpg',
  connected_at: '2026-01-01T00:00:00Z',
};

export const mockChannels: ConnectedYouTubeChannel[] = [mockChannel];

export const mockComment: YouTubeComment = {
  comment_id: 'comment123',
  author_name: 'Test User',
  author_thumbnail_url: 'https://example.com/avatar.jpg',
  text: 'Great video!',
  like_count: 5,
  published_at: '2026-01-01T00:00:00Z',
  reply_count: 2,
  can_reply: true,
};

export const mockComments: YouTubeComment[] = [
  mockComment,
  {
    ...mockComment,
    comment_id: 'comment456',
    text: 'Thanks for sharing!',
  },
];

export const mockCaption: Caption = {
  caption_id: 'caption123',
  language: 'en',
  name: 'English',
  track_kind: 'standard',
  is_draft: false,
};

export const mockCaptions: Caption[] = [
  mockCaption,
  {
    ...mockCaption,
    caption_id: 'caption456',
    language: 'es',
    name: 'Spanish',
  },
];
