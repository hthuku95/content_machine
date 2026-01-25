import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistService } from '@/services/playlist.service';
import type { CreatePlaylistRequest, UpdatePlaylistRequest, AddVideoToPlaylistRequest } from '@/types/playlist.types';
import toast from 'react-hot-toast';

export function usePlaylists() {
  const queryClient = useQueryClient();

  const { data: playlists = [], isLoading, error } = useQuery({
    queryKey: ['youtube', 'playlists'],
    queryFn: playlistService.listPlaylists,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlaylistRequest) => playlistService.createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'playlists'] });
      toast.success('Playlist created successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlaylistRequest }) =>
      playlistService.updatePlaylist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'playlists'] });
      toast.success('Playlist updated successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playlistService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'playlists'] });
      toast.success('Playlist deleted successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const addVideoMutation = useMutation({
    mutationFn: ({ playlistId, data }: { playlistId: string; data: AddVideoToPlaylistRequest }) =>
      playlistService.addVideoToPlaylist(playlistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'playlists'] });
      toast.success('Video added to playlist');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const removeVideoMutation = useMutation({
    mutationFn: ({ playlistId, videoId }: { playlistId: string; videoId: string }) =>
      playlistService.removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'playlists'] });
      toast.success('Video removed from playlist');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  return {
    playlists,
    isLoading,
    error,
    createPlaylist: createMutation.mutate,
    isCreating: createMutation.isPending,
    updatePlaylist: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deletePlaylist: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    addVideo: addVideoMutation.mutate,
    isAddingVideo: addVideoMutation.isPending,
    removeVideo: removeVideoMutation.mutate,
    isRemovingVideo: removeVideoMutation.isPending,
  };
}
