// Instagram lead generation service — whitelisted users can search
// for Instagram creators by hashtag and generate cold DM scripts.

import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

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

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

export const instagramLeadsService = {
  /** Launch a PhantomBuster hashtag search */
  searchByHashtag: async (
    hashtag: string,
    maxPosts: number = 50,
    category?: string,
  ): Promise<SearchResponse> => {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/instagram/leads/search`,
      { hashtag, max_posts: maxPosts, category: category || hashtag },
      { headers: getAuthHeaders() },
    );
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
    const { data } = await axios.get(`${API_BASE_URL}/api/instagram/leads`, {
      headers: getAuthHeaders(),
      params,
    });
    return data;
  },

  /** Generate a cold DM script for a lead */
  generateDm: async (id: string, niche?: string): Promise<DmResponse> => {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/instagram/leads/${id}/generate-dm`,
      niche ? { niche } : null,
      { headers: getAuthHeaders() },
    );
    return data;
  },

  /** Update contact status */
  updateContactStatus: async (
    id: string,
    contact_status: InstagramLead['contact_status'],
  ): Promise<{ success: boolean }> => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/instagram/leads/${id}/contact-status`,
      { contact_status },
      { headers: getAuthHeaders() },
    );
    return data;
  },
};
