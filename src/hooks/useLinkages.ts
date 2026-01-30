import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clippingService } from '@/services/clipping.service';
import type { CreateLinkageRequest, UpdateLinkageRequest } from '@/types/clipping.types';
import toast from 'react-hot-toast';

export function useLinkages() {
  const queryClient = useQueryClient();

  // Query for listing linkages
  const { data, isLoading, error } = useQuery({
    queryKey: ['clipping', 'linkages'],
    queryFn: clippingService.listLinkages,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Ensure linkages is always an array, even if the query fails
  const linkages = Array.isArray(data) ? data : [];

  // Mutation for creating a linkage
  const createMutation = useMutation({
    mutationFn: (data: CreateLinkageRequest) => clippingService.createLinkage(data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'linkages'] });
      toast.success('Linkage created successfully');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Mutation for updating a linkage
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkageRequest }) =>
      clippingService.updateLinkage(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'linkages'] });
      toast.success('Linkage updated');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Mutation for deleting a linkage
  const deleteMutation = useMutation({
    mutationFn: (id: string) => clippingService.deleteLinkage(id),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clipping', 'linkages'] });
      toast.success('Linkage deleted');
    },
    onError: () => {
      // Error handled by interceptor
    },
  });

  // Toggle active status
  const toggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      data: { is_active: !currentStatus },
    });
  };

  return {
    linkages,
    isLoading,
    error,
    createLinkage: createMutation.mutate,
    updateLinkage: updateMutation.mutate,
    deleteLinkage: deleteMutation.mutate,
    toggleActive,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
