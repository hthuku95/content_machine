import { useState } from 'react';
import { Box, Typography, Container, Paper, FormControl, InputLabel, Select, MenuItem, Stack, CircularProgress, Alert } from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/services/video.service';
import { useComments, useCommentActions } from '@/hooks/useComments';
import { CommentCard } from '@/components/youtube/comments/CommentCard';
import { CommentFilters } from '@/components/youtube/comments/CommentFilters';
import { ReplyDialog } from '@/components/youtube/comments/ReplyDialog';
import type { YouTubeComment } from '@/types/comment.types';

export function CommentModerationPage() {
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [maxResults, setMaxResults] = useState(25);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<YouTubeComment | null>(null);

  // Fetch list of videos
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['youtube', 'uploads'],
    queryFn: () => videoService.listUploads(),
  });

  // Fetch comments for selected video
  const { data: comments = [], isLoading: commentsLoading, error } = useComments(selectedVideoId, maxResults);

  const { deleteComment } = useCommentActions(selectedVideoId);

  const handleReply = (comment: YouTubeComment) => {
    setSelectedComment(comment);
    setReplyDialogOpen(true);
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment(commentId);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Comment Moderation
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Moderate and reply to video comments
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
                No videos found. Upload a video first to moderate comments.
              </Alert>
            )}
          </Paper>

          {/* Comment Filters */}
          {selectedVideoId && (
            <CommentFilters maxResults={maxResults} onChange={setMaxResults} disabled={commentsLoading} />
          )}

          {/* Loading State */}
          {commentsLoading && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading comments...
              </Typography>
            </Paper>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error">
              Failed to load comments. Please try again.
            </Alert>
          )}

          {/* Comments List */}
          {!commentsLoading && selectedVideoId && comments.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Comments ({comments.length})
              </Typography>
              <Stack spacing={1}>
                {comments.map((comment) => (
                  <CommentCard
                    key={comment.comment_id}
                    comment={comment}
                    onReply={handleReply}
                    onDelete={handleDelete}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* No Comments */}
          {!commentsLoading && selectedVideoId && comments.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <CommentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Comments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This video doesn't have any comments yet
              </Typography>
            </Paper>
          )}

          {/* Initial Empty State */}
          {!selectedVideoId && !videosLoading && videos.length > 0 && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <CommentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Select a Video
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a video to view and moderate its comments
              </Typography>
            </Paper>
          )}
        </Stack>

        {/* Reply Dialog */}
        <ReplyDialog
          open={replyDialogOpen}
          comment={selectedComment}
          videoId={selectedVideoId}
          onClose={() => setReplyDialogOpen(false)}
        />
      </Box>
    </Container>
  );
}
