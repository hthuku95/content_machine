import { api } from '@/services/api';

export interface Campaign {
  id: string;
  name: string;
  service_type: string;
  brief: string;
  style: string | null;
  duration: number;
  schedule: Array<{ time: string; platform: string }>;
  platforms: Array<{ platform: string; account_id: string }>;
  posts_per_day: number;
  start_date: string;
  end_date: string;
  zernio_profile_id: string | null;
  source_url: string | null;
  status: string;
  total_posts_planned: number;
  total_posts_published: number;
  paid_until: string | null;
  created_at: string;
}

export interface CampaignPost {
  id: string;
  day_number: number;
  slot_index: number;
  scheduled_at: string;
  variation_prompt: string | null;
  caption: string | null;
  media_r2_url: string | null;
  status: string;
  zernio_post_id: string | null;
}

export interface CreateCampaignRequest {
  name: string;
  service_type: string;
  brief: string;
  style?: string | null;
  duration?: number | null;
  schedule: Array<{ time: string; platform: string }>;
  platforms: Array<{ platform: string; account_id: string }>;
  posts_per_day?: number | null;
  start_date: string;
  end_date: string;
  zernio_profile_id?: string | null;
  source_url?: string | null;
}

export interface CreateCampaignResponse {
  success: boolean;
  id?: string;
  status?: string;
  payment_url?: string;
  error?: string;
}

export const campaignService = {
  async list(): Promise<Campaign[]> {
    const resp = await api.get<{ success: boolean; campaigns: Campaign[] }>('/api/campaigns');
    return resp.data.campaigns || [];
  },

  async get(id: string): Promise<{ campaign: Campaign; posts: CampaignPost[] }> {
    const resp = await api.get<{ success: boolean; campaign: Campaign; posts: CampaignPost[] }>(`/api/campaigns/${id}`);
    return { campaign: resp.data.campaign, posts: resp.data.posts || [] };
  },

  async create(req: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    const resp = await api.post<CreateCampaignResponse>('/api/campaigns', req);
    return resp.data;
  },

  async getPosts(id: string): Promise<CampaignPost[]> {
    const resp = await api.get<{ success: boolean; posts: CampaignPost[] }>(`/api/campaigns/${id}/posts`);
    return resp.data.posts || [];
  },

  async pause(id: string): Promise<void> {
    await api.post(`/api/campaigns/${id}/pause`);
  },

  async resume(id: string): Promise<void> {
    await api.post(`/api/campaigns/${id}/resume`);
  },

  async cancel(id: string): Promise<void> {
    await api.post(`/api/campaigns/${id}/cancel`);
  },
};
