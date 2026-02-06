// YouTube channel related types

export interface ConnectedYouTubeChannel {
  id: number;                           // Backend sends i32
  channel_id: string;
  channel_name: string;                 // Backend sends "channel_name", not "channel_title"
  channel_description: string | null;
  channel_thumbnail_url: string | null;
  subscriber_count: number | null;      // Backend sends i64
  video_count: number | null;           // Backend sends i64
  is_active: boolean;
  requires_reauth: boolean;             // Whether channel needs reconnection
  connected_at: string;                 // Backend sends DateTime as ISO string
}

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  thumbnail_url: string | null;
}
