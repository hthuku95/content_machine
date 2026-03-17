import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';
import type { CreateTwitchMappingRequest, TwitchChannelSearchResult } from '@/types/clipping.types';
import toast from 'react-hot-toast';

export function useTwitchMappings() {
  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = useState<TwitchChannelSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: mappings = [], isLoading: isMappingsLoading } = useQuery({
    queryKey: ['clipping', 'twitch-mappings'],
    queryFn: clippingService.listTwitchMappings,
    staleTime: 1000 * 60 * 5,
  });

  const { data: twitchChannels = [], isLoading: isChannelsLoading } = useQuery({
    queryKey: ['clipping', 'twitch-source-channels'],
    queryFn: clippingService.listTwitchSourceChannels,
    staleTime: 1000 * 60 * 5,
  });

  const addChannelMutation = useMutation({
    mutationFn: clippingService.addTwitchSourceChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'twitch-source-channels'] });
      toast.success('Twitch channel added');
    },
  });

  const removeChannelMutation = useMutation({
    mutationFn: (id: number) => clippingService.removeTwitchSourceChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'twitch-source-channels'] });
      toast.success('Twitch channel removed');
    },
  });

  const createMappingMutation = useMutation({
    mutationFn: (data: CreateTwitchMappingRequest) => clippingService.createTwitchMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'twitch-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['clipping', 'source-channels'] });
      toast.success('Mapping created');
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: (id: number) => clippingService.deleteTwitchMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'twitch-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['clipping', 'source-channels'] });
      toast.success('Mapping removed');
    },
  });

  const searchChannels = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await clippingService.searchTwitchChannels(query);
      setSearchResults(results);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => setSearchResults([]);

  return {
    mappings,
    twitchChannels,
    isMappingsLoading,
    isChannelsLoading,
    searchResults,
    isSearching,
    searchChannels,
    clearSearch,
    addTwitchChannel: addChannelMutation.mutate,
    removeChannel: removeChannelMutation.mutate,
    createMapping: createMappingMutation.mutate,
    deleteMapping: deleteMappingMutation.mutate,
    isAddingChannel: addChannelMutation.isPending,
    isRemovingChannel: removeChannelMutation.isPending,
    isCreatingMapping: createMappingMutation.isPending,
    isDeletingMapping: deleteMappingMutation.isPending,
  };
}
