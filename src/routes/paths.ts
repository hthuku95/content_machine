// Route path constants

export const PATHS = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  OAUTH_CALLBACK: '/auth/callback',

  // Main routes
  DASHBOARD: '/',

  // Clipping routes
  CLIPPING: {
    ROOT: '/clipping',
    OVERVIEW: '/clipping/overview',
    SOURCE_CHANNELS: '/clipping/source-channels',
    LINKAGES: '/clipping/linkages',
    JOBS: '/clipping/jobs',
    JOB_DETAILS: (id: string) => `/clipping/jobs/${id}`,
    CLIPS: '/clipping/clips',
    CLIP_DETAILS: (id: string) => `/clipping/clips/${id}`,
    TWITCH_MAPPINGS: '/clipping/twitch-mappings',
  },

  // Channels routes
  CHANNELS: {
    ROOT: '/channels',
    CONNECTED: '/channels/connected',
  },

  // YouTube routes
  YOUTUBE: {
    ROOT: '/youtube',
    UPLOAD: '/youtube/upload',
    UPLOADS: '/youtube/uploads',
    PLAYLISTS: '/youtube/playlists',
    ANALYTICS: '/youtube/analytics',
    SEARCH: '/youtube/search',
    COMMENTS: '/youtube/comments',
    CAPTIONS: '/youtube/captions',
  },

  // Settings routes
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    APPEARANCE: '/settings/appearance',
    ACCOUNT: '/settings/account',
  },

  // Video Tools
  VIDEO_TOOLS: '/video-tools',

  // AI Agent Chat
  AGENT_CHAT: '/agent',

  // Gig Templates (Fiverr/PPH)
  GIG_TEMPLATES: '/gig-templates',

  // Manual Clipping (no destination channel required)
  MANUAL_CLIPPING: '/manual-clipping',

  // Other
  NOT_FOUND: '/404',
};
