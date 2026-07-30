import { api } from './api';

export interface ReferralCode {
  id: string;
  code: string;
  ref_url: string;
  created_at: string;
}

export interface ReferralCommission {
  id: string;
  prospect_id: string;
  deal_amount_cents: number;
  commission_rate: number;
  commission_cents: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
}

export interface MyCodeResponse {
  success: boolean;
  code: ReferralCode | null;
}

export interface MyCommissionsResponse {
  success: boolean;
  commissions: ReferralCommission[];
  total_earned_cents: number;
}

export const referralService = {
  async getMyCodes(): Promise<MyCodeResponse> {
    const { data } = await api.get('/api/referrals/my-code');
    return data;
  },

  async createCode(code?: string): Promise<ReferralCode> {
    const { data } = await api.post('/api/referrals/my-code', { code });
    if (!data.success) throw new Error(data.error || 'Failed to create code');
    return data.code;
  },

  async getMyCommissions(): Promise<MyCommissionsResponse> {
    const { data } = await api.get('/api/referrals/my-commissions');
    return data;
  },
};
