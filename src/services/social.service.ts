import { api } from '@/services/api';

export interface ZernioProfile {
  id: string;
  name: string;
  created_at?: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
  avatar_url?: string;
  status?: string;
  created_at?: string;
}

export const socialService = {
  async listProfiles(): Promise<ZernioProfile[]> {
    const resp = await api.get<{ success: boolean; profiles: ZernioProfile[] }>('/api/social/profiles');
    return resp.data.profiles || [];
  },

  async getMyProfile(): Promise<ZernioProfile | null> {
    try {
      const resp = await api.get<{ success: boolean; profile: ZernioProfile | null }>('/api/social/my-profile');
      return resp.data.profile || null;
    } catch {
      return null;
    }
  },

  async createProfile(name: string): Promise<ZernioProfile> {
    const resp = await api.post<{ success: boolean; profile: ZernioProfile }>('/api/social/create-profile', { name });
    return resp.data.profile;
  },

  async getConnectUrl(platform: string, profileId: string): Promise<string> {
    const resp = await api.get<{ success: boolean; url: string }>(
      `/api/social/connect-url?platform=${platform}&profile_id=${profileId}`
    );
    return resp.data.url;
  },

  async listAccounts(): Promise<SocialAccount[]> {
    const resp = await api.get<{ success: boolean; accounts: SocialAccount[] }>('/api/social/my-accounts');
    return resp.data.accounts || [];
  },
};
