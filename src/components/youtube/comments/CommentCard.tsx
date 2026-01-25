import { Card, CardContent, CardActions, Box, Avatar, Typography, Button } from '@mui/material';
import { ThumbUp as ThumbUpIcon, Reply as ReplyIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { YouTubeComment } from '@/types/comment.types';

export interface CommentCardProps {
  comment: YouTubeComment;
  onReply?: (comment: YouTubeComment) => void;
  onDelete: (commentId: string) => void;
}

export function CommentCard({ comment, onReply, onDelete }: CommentCardProps) {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar src={comment.author_thumbnail_url} alt={comment.author_name}>
            {comment.author_name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2">{comment.author_name}</Typography>

            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(parseISO(comment.published_at), { addSuffix: true })}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {comment.text}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThumbUpIcon fontSize="small" color="action" />
                <Typography variant="caption">{comment.like_count}</Typography>
              </Box>
              {comment.reply_count > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        {comment.can_reply && onReply && (
          <Button size="small" startIcon={<ReplyIcon />} onClick={() => onReply(comment)}>
            Reply
          </Button>
        )}
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(comment.comment_id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}
