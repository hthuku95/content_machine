import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '@/services/comment.service';
import type { ReplyToCommentRequest } from '@/types/comment.types';
import toast from 'react-hot-toast';

export function useComments(videoId: string, maxResults?: number) {
  return useQuery({
    queryKey: ['youtube', 'comments', videoId, maxResults],
    queryFn: () => commentService.getVideoComments(videoId, maxResults),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!videoId,
  });
}

export function useCommentActions(videoId: string) {
  const queryClient = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: ReplyToCommentRequest }) =>
      commentService.replyToComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'comments', videoId] });
      toast.success('Reply posted successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'comments', videoId] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  return {
    replyToComment: replyMutation.mutate,
    isReplying: replyMutation.isPending,
    deleteComment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
