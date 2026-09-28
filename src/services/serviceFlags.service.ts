import { api } from '@/services/api';

export interface ServiceFlag {
  service: string;
  enabled: boolean;
  updated_by: string | null;
  updated_at: string | null;
}

export const serviceFlagsService = {
  listFlags: async (): Promise<ServiceFlag[]> => {
    const { data } = await api.get<{ success: boolean; flags: ServiceFlag[]; error?: string }>(
      '/api/admin/service-flags',
    );
    if (!data.success) throw new Error(data.error || 'Failed to load service flags');
    return data.flags ?? [];
  },

  setFlag: async (service: string, enabled: boolean): Promise<ServiceFlag> => {
    const { data } = await api.post<{
      success: boolean;
      service: string;
      enabled: boolean;
      updated_by: string;
      updated_at: string;
      error?: string;
    }>('/api/admin/service-flags', { service, enabled });
    if (!data.success) throw new Error(data.error || 'Failed to set service flag');
    return {
      service: data.service,
      enabled: data.enabled,
      updated_by: data.updated_by,
      updated_at: data.updated_at,
    };
  },
};
