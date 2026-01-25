import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';
import type { CreateSourceChannelRequest, UpdateSourceChannelRequest } from '@/types/clipping.types';
import toast from 'react-hot-toast';

export function useSourceChannels() {
  const queryClient = useQueryClient();

  // Query for listing source channels
  const { data: channels = [], isLoading, error } = useQuery({
    queryKey: ['clipping', 'source-channels'],
    queryFn: clippingService.listSourceChannels,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for adding a source channel
  const addMutation = useMutation({
    mutationFn: (data: CreateSourceChannelRequest) =>
      clippingService.addSourceChannel(data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'source-channels'] });
      toast.success('Source channel added successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Mutation for updating a source channel
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSourceChannelRequest }) =>
      clippingService.updateSourceChannel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'source-channels'] });
      toast.success('Source channel updated');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Mutation for removing a source channel
  const removeMutation = useMutation({
    mutationFn: (id: string) => clippingService.removeSourceChannel(id),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'source-channels'] });
      toast.success('Source channel removed');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Toggle active status (optimistic update)
  const toggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      data: { is_active: !currentStatus },
    });
  };

  return {
    channels,
    isLoading,
    error,
    addChannel: addMutation.mutate,
    updateChannel: updateMutation.mutate,
    removeChannel: removeMutation.mutate,
    toggleActive,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
