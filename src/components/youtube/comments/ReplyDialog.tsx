import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { replyToCommentSchema, type ReplyToCommentInput } from '@/utils/youtube-validation.schemas';
import { useCommentActions } from '@/hooks/useComments';
import type { YouTubeComment } from '@/types/comment.types';

export interface ReplyDialogProps {
  open: boolean;
  comment: YouTubeComment | null;
  videoId: string;
  onClose: () => void;
}

export function ReplyDialog({ open, comment, videoId, onClose }: ReplyDialogProps) {
  const { replyToComment, isReplying } = useCommentActions(videoId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReplyToCommentInput>({
    resolver: zodResolver(replyToCommentSchema),
  });

  const onSubmit = (data: ReplyToCommentInput) => {
    if (!comment) return;
    replyToComment(
      { commentId: comment.comment_id, data },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isReplying) {
      onClose();
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reply to Comment</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Replying to <strong>{comment?.author_name}</strong>:
          </Typography>

          <Typography
            variant="body2"
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1,
              mb: 2,
              fontStyle: 'italic',
            }}
          >
            "{comment?.text}"
          </Typography>

          <TextField
            label="Your Reply"
            {...register('text')}
            error={!!errors.text}
            helperText={errors.text?.message}
            disabled={isReplying}
            multiline
            rows={4}
            fullWidth
            autoFocus
            placeholder="Write your reply..."
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isReplying}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isReplying}
            startIcon={isReplying ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {isReplying ? 'Posting...' : 'Post Reply'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
