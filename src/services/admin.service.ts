import { api } from '@/services/api';
import type {
  AdminStats,
  AdminUser,
  Campaign,
  CreateDeliveryRequest,
  CreateDeliveryResponse,
  DeliveriesResponse,
  Delivery,
  GenerateOutreachRequest,
  GenerateOutreachResponse,
  GenerateSamplePackResponse,
  Prospect,
  ProspectsResponse,
  RegenerateDmResponse,
  SendEmailResponse,
  UpdateProspectRequest,
} from '@/types/admin.types';

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListProspectsParams {
  prospect_type?: string;
  contact_status?: string;
  platform?: string;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<{ success: boolean; stats: AdminStats }>('/api/admin/stats');
    return data.stats;
  },

  listUsers: async (params: AdminUsersParams = {}): Promise<AdminUser[]> => {
    const { data } = await api.get<{ success: boolean; users: AdminUser[]; total: number }>('/api/admin/users', { params });
    return (data.users ?? []).map((u) => ({ ...u, id: Number(u.id) }));
  },

  listDeliveries: async (): Promise<Delivery[]> => {
    const { data } = await api.get<DeliveriesResponse>('/api/admin/deliveries');
    if (!data.deliveries) throw new Error(data.error || 'Failed to load deliveries');
    return data.deliveries;
  },

  createDelivery: async (req: CreateDeliveryRequest): Promise<CreateDeliveryResponse> => {
    const { data } = await api.post<CreateDeliveryResponse>('/api/admin/deliveries', req);
    return data;
  },

  listProspects: async (params: ListProspectsParams = {}): Promise<Prospect[]> => {
    const { data } = await api.get<ProspectsResponse>('/api/admin/prospects', {
      params: {
        prospect_type: params.prospect_type || undefined,
        contact_status: params.contact_status || undefined,
        platform: params.platform || undefined,
      },
    });
    if (!data.success) throw new Error(data.error || 'Failed to load prospects');
    return data.prospects;
  },

  updateProspect: async (id: string, req: UpdateProspectRequest): Promise<void> => {
    await api.patch(`/api/admin/prospects/${id}`, req);
  },

  deleteProspect: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/prospects/${id}`);
  },

  regenerateDm: async (id: string): Promise<RegenerateDmResponse> => {
    const { data } = await api.post<RegenerateDmResponse>(`/api/admin/prospects/${id}/dm-script`);
    return data;
  },

  generateOutreach: async (id: string, req: GenerateOutreachRequest): Promise<GenerateOutreachResponse> => {
    const { data } = await api.post<GenerateOutreachResponse>(
      `/api/admin/prospects/${id}/generate-outreach`, req);
    return data;
  },

  generateSamplePack: async (
    id: string,
    req: { source_url?: string; product_name?: string; offer_type?: string; notes?: string },
  ): Promise<GenerateSamplePackResponse> => {
    const { data } = await api.post<GenerateSamplePackResponse>(
      `/api/admin/prospects/${id}/generate-sample-pack`, req);
    return data;
  },

  sendEmail: async (id: string): Promise<SendEmailResponse> => {
    const { data } = await api.post<SendEmailResponse>(`/api/admin/prospects/${id}/send-email`);
    return data;
  },

  listCampaigns: async (): Promise<Campaign[]> => {
    const { data } = await api.get<{ success: boolean; campaigns: Campaign[]; error?: string }>('/api/admin/campaigns');
    if (!data.success) throw new Error(data.error || 'Failed to load campaigns');
    return data.campaigns;
  },

  campaignAction: async (id: string, action: 'pause' | 'resume' | 'cancel'): Promise<void> => {
    await api.post(`/api/admin/campaigns/${id}/${action}`);
  },
};