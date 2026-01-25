import { useState } from 'react';
import { Box, Typography, Container, Paper, FormControl, InputLabel, Select, MenuItem, Stack, Button, CircularProgress, Alert } from '@mui/material';
import { Subtitles as SubtitlesIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/services/video.service';
import { useCaptions, useCaptionActions } from '@/hooks/useCaptions';
import { CaptionCard } from '@/components/youtube/captions/CaptionCard';
import { UploadCaptionDialog } from '@/components/youtube/captions/UploadCaptionDialog';

export function CaptionsPage() {
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch list of videos
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['youtube', 'uploads'],
    queryFn: () => videoService.listUploads(),
  });

  // Fetch captions for selected video
  const { data: captions = [], isLoading: captionsLoading, error } = useCaptions(selectedVideoId);

  const { deleteCaption } = useCaptionActions(selectedVideoId);

  const handleDelete = (captionId: string) => {
    if (confirm('Are you sure you want to delete this caption track?')) {
      deleteCaption(captionId);
    }
  };

  const selectedVideo = videos.find((v) => v.youtube_video_id === selectedVideoId);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Captions Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload and manage video captions
        </Typography>

        <Stack spacing={3}>
          {/* Video Selector */}
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth disabled={videosLoading}>
              <InputLabel>Select Video</InputLabel>
              <Select
                value={selectedVideoId}
                onChange={(e) => setSelectedVideoId(e.target.value)}
                label="Select Video"
              >
                <MenuItem value="">Select a video...</MenuItem>
                {videos.map((video) => (
                  <MenuItem key={video.id} value={video.youtube_video_id}>
                    {video.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {videos.length === 0 && !videosLoading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No videos found. Upload a video first to manage captions.
              </Alert>
            )}
          </Paper>

          {/* Upload Caption Button */}
          {selectedVideoId && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Caption
              </Button>
            </Box>
          )}

          {/* Loading State */}
          {captionsLoading && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading captions...
              </Typography>
            </Paper>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error">
              Failed to load captions. Please try again.
            </Alert>
          )}

          {/* Captions List */}
          {!captionsLoading && selectedVideoId && captions.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Caption Tracks ({captions.length})
              </Typography>
              <Stack spacing={2}>
                {captions.map((caption) => (
                  <CaptionCard key={caption.caption_id} caption={caption} onDelete={handleDelete} />
                ))}
              </Stack>
            </Box>
          )}

          {/* No Captions */}
          {!captionsLoading && selectedVideoId && captions.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <SubtitlesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Captions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This video doesn't have any caption tracks yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Caption
              </Button>
            </Paper>
          )}

          {/* Initial Empty State */}
          {!selectedVideoId && !videosLoading && videos.length > 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <SubtitlesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Select a Video
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a video to manage its captions
              </Typography>
            </Paper>
          )}
        </Stack>

        {/* Upload Caption Dialog */}
        <UploadCaptionDialog
          open={uploadDialogOpen}
          videoId={selectedVideoId}
          videoTitle={selectedVideo?.title}
          onClose={() => setUploadDialogOpen(false)}
        />
      </Box>
    </Container>
  );
}
