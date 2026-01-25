import { Box, Typography, Paper } from '@mui/material';
import { VideoLibrary as VideoIcon } from '@mui/icons-material';
import type { ExtractedClip } from '@/types/clipping.types';

interface ClipVideoPlayerProps {
  clip: ExtractedClip;
}

export function ClipVideoPlayer({ clip }: ClipVideoPlayerProps) {
  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string | null): string | null => {
    if (!url) return null;

    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || null;
    }

    // Handle youtube.com URLs
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
  };

  const videoId = clip.youtube_video_id || getYouTubeVideoId(clip.youtube_url);

  if (!videoId) {
    // Show placeholder if video not yet uploaded
    return (
      <Paper
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          p: 4,
        }}
      >
        <VideoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Video Not Available
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {clip.upload_status === 'pending'
            ? 'This clip is pending upload'
            : clip.upload_status === 'uploading'
            ? 'This clip is currently being uploaded'
            : clip.upload_status === 'failed'
            ? 'Upload failed - video not available'
            : 'Video not yet available'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 aspect ratio
        bgcolor: 'black',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={clip.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
}
