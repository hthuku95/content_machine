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

  // Other
  NOT_FOUND: '/404',
};
