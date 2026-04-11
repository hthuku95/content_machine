// Instagram lead generation service — whitelisted users can search
// for Instagram creators by hashtag and generate cold DM scripts.

import { api } from '@/services/api';

export interface InstagramLead {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  followers_count: number | null;
  profile_url: string | null;
  profile_pic_url: string | null;
  is_verified: boolean;
  category: string | null;
  hashtag_source: string | null;
  email: string | null;
  external_url: string | null;
  dm_script: string | null;
  contact_status: 'new' | 'contacted' | 'replied' | 'converted' | 'skipped';
  score?: number | null;
  score_reason?: string | null;
}

export interface SearchResponse {
  success: boolean;
  job_id?: string;
  container_id?: string;
  agent_name?: string;
  hashtag?: string;
  max_posts?: number;
  message?: string;
  error?: string;
}

export interface LeadsListResponse {
  success: boolean;
  leads: InstagramLead[];
  count: number;
  error?: string;
}

export interface DmResponse {
  success: boolean;
  dm_script?: string;
  error?: string;
}

export interface AutoDiscoverResponse {
  success: boolean;
  niche?: string;
  hashtags?: string[];
  jobs?: Array<{ job_id: string; hashtag: string; container_id: string }>;
  errors?: string[];
  message?: string;
  error?: string;
}

export const instagramLeadsService = {
  /** AI picks hashtags for a niche and auto-launches PB searches */
  autoDiscover: async (params: {
    niche?: string;
    max_posts_per_hashtag?: number;
    hashtag_count?: number;
  }): Promise<AutoDiscoverResponse> => {
    const { data } = await api.post('/api/instagram/leads/auto-discover', params);
    return data;
  },

  /** Get top-scored leads (score >= 60) ready for outreach */
  getTopLeads: async (): Promise<LeadsListResponse> => {
    const { data } = await api.get('/api/instagram/leads/top');
    return data;
  },

  /** Launch a PhantomBuster hashtag search */
  searchByHashtag: async (
    hashtag: string,
    maxPosts: number = 50,
    category?: string,
  ): Promise<SearchResponse> => {
    const { data } = await api.post('/api/instagram/leads/search', {
      hashtag,
      max_posts: maxPosts,
      category: category || hashtag,
    });
    return data;
  },

  /** List leads with optional filtering */
  listLeads: async (params?: {
    hashtag?: string;
    contact_status?: string;
    min_followers?: number;
    limit?: number;
    offset?: number;
  }): Promise<LeadsListResponse> => {
    const { data } = await api.get('/api/instagram/leads', { params });
    return data;
  },

  /** Generate a cold DM script for a lead */
  generateDm: async (id: string, niche?: string): Promise<DmResponse> => {
    const { data } = await api.post(
      `/api/instagram/leads/${id}/generate-dm`,
      niche ? { niche } : null,
    );
    return data;
  },

  /** Update contact status */
  updateContactStatus: async (
    id: string,
    contact_status: InstagramLead['contact_status'],
  ): Promise<{ success: boolean }> => {
    const { data } = await api.patch(
      `/api/instagram/leads/${id}/contact-status`,
      { contact_status },
    );
    return data;
  },
};
