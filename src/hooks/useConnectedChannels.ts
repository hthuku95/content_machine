import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelsService } from '@/services/channels.service';
import toast from 'react-hot-toast';

export function useConnectedChannels() {
  const queryClient = useQueryClient();

  const { data: channels = [], isLoading, error } = useQuery({
    queryKey: ['youtube', 'channels'],
    queryFn: channelsService.listConnectedChannels,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: number) => channelsService.disconnectChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'channels'] });
      toast.success('Channel disconnected');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const refreshMutation = useMutation({
    mutationFn: (id: number) => channelsService.refreshChannelToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtube', 'channels'] });
      toast.success('Channel token refreshed');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  const connectMutation = useMutation({
    mutationFn: (redirectTo?: string) => channelsService.initiateConnection(redirectTo),
    onError: (error: any) => {
      toast.error(error.message || 'Failed to initiate YouTube connection');
    },
  });

  return {
    channels,
    isLoading,
    error,
    disconnectChannel: disconnectMutation.mutate,
    connectChannel: connectMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    refreshToken: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  };
}
