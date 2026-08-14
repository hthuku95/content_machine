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
  profile_id?: string | null;
  created_at?: string;
}

export const socialService = {
  async listProfiles(): Promise<ZernioProfile[]> {
    const resp = await api.get<{ success: boolean; profiles: ZernioProfile[] }>('/api/social/profiles');
    return resp.data.profiles || [];
  },

  async listMyProfiles(): Promise<ZernioProfile[]> {
    const resp = await api.get<{ success: boolean; profiles: ZernioProfile[] }>('/api/social/my-profiles');
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

  async getConnectUrl(platform: string, profileId: string, redirectUrl?: string): Promise<string> {
    let url = `/api/social/connect-url?platform=${platform}&profile_id=${profileId}`;
    if (redirectUrl) {
      url += `&redirect_url=${encodeURIComponent(redirectUrl)}`;
    }
    const resp = await api.get<{ success: boolean; authUrl: string }>(url);
    return resp.data.authUrl;
  },

  /** Resolves (or creates) the caller's default profile and returns an OAuth URL for it. */
  async getMyConnectUrl(platform: string, redirectUrl?: string): Promise<string> {
    const resp = await api.post<{ success: boolean; authUrl: string }>('/api/social/my-connect-url', {
      platform,
      redirect_url: redirectUrl,
    });
    return resp.data.authUrl;
  },

  async listAccounts(): Promise<SocialAccount[]> {
    const resp = await api.get<{ success: boolean; accounts: SocialAccount[] }>('/api/social/my-accounts');
    return resp.data.accounts || [];
  },

  /** Re-pull the user's connected accounts from Zernio into the local cache. */
  async syncMyAccounts(): Promise<{ success: boolean; error?: string }> {
    try {
      const resp = await api.post<{ success: boolean; error?: string }>('/api/social/sync-accounts');
      return resp.data;
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.error || 'Failed to sync accounts' };
    }
  },
};
