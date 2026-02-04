import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Paper,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, VideoLibrary as VideoLibraryIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { videoService } from '@/services/video.service';
import { useVideos } from '@/hooks/useVideos';
import { VideoCard } from '@/components/youtube/videos/VideoCard';
import { EditVideoDialog } from '@/components/youtube/videos/EditVideoDialog';
import { ScheduleVideoDialog } from '@/components/youtube/videos/ScheduleVideoDialog';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { PATHS } from '@/routes/paths';
import type { YouTubeVideo } from '@/types/video.types';

export function UploadHistoryPage() {
  console.log('[UploadHistoryPage] Component mounted');

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['youtube', 'uploads'],
    queryFn: () => videoService.listUploads(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log('[UploadHistoryPage] Videos loaded:', { count: videos.length, isLoading });

  const { deleteVideo, isDeleting } = useVideos();

  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = (video: YouTubeVideo) => {
    console.log('[UploadHistoryPage] Action: Edit video', video.id);
    setSelectedVideo(video);
    setEditDialogOpen(true);
    console.log('[UploadHistoryPage] State updated: Edit dialog opened');
  };

  const handleDelete = (videoId: string) => {
    console.log('[UploadHistoryPage] Action: Delete video', videoId);
    const video = videos.find((v) => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      setDeleteDialogOpen(true);
      console.log('[UploadHistoryPage] State updated: Delete dialog opened');
    }
  };

  const handleSchedule = (video: YouTubeVideo) => {
    console.log('[UploadHistoryPage] Action: Schedule video', video.id);
    setSelectedVideo(video);
    setScheduleDialogOpen(true);
    console.log('[UploadHistoryPage] State updated: Schedule dialog opened');
  };

  const confirmDelete = () => {
    if (selectedVideo) {
      console.log('[UploadHistoryPage] Action: Confirm delete', selectedVideo.id);
      deleteVideo(selectedVideo.id, {
        onSuccess: () => {
          console.log('[UploadHistoryPage] Delete successful');
          setDeleteDialogOpen(false);
          setSelectedVideo(null);
          console.log('[UploadHistoryPage] State updated: Delete dialog closed');
        },
        onError: (error) => {
          console.error('[UploadHistoryPage] Error: Delete failed', error);
        },
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              My Videos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage your uploaded YouTube videos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            component={RouterLink}
            to={PATHS.YOUTUBE.UPLOAD}
          >
            Upload Video
          </Button>
        </Box>

        {isLoading ? (
          <GridSkeleton count={6} type="clip" columns={{ xs: 1, sm: 2, md: 3 }} />
        ) : videos.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <VideoLibraryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Videos Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your first video to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              component={RouterLink}
              to={PATHS.YOUTUBE.UPLOAD}
            >
              Upload Video
            </Button>
          </Paper>
        ) : (
          <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3 }}>
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSchedule={handleSchedule}
              />
            ))}
          </ResponsiveGrid>
        )}

        {/* Edit Video Dialog */}
        <EditVideoDialog open={editDialogOpen} video={selectedVideo} onClose={() => setEditDialogOpen(false)} />

        {/* Schedule Video Dialog */}
        <ScheduleVideoDialog
          open={scheduleDialogOpen}
          video={selectedVideo}
          onClose={() => setScheduleDialogOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Video</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{selectedVideo?.title}"? This will remove it from YouTube permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              color="error"
              disabled={isDeleting}
              startIcon={isDeleting && <CircularProgress size={16} />}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
