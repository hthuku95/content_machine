import { api } from '@/services/api';

export interface PortfolioSample {
  id: string;
  delivery_id: string;
  delivery_url: string;
  client_ref?: string | null;
  title: string;
  company?: string | null;
  gig_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | string;
  source_url?: string | null;
  output_r2_url?: string | null;
  preview_r2_url?: string | null;
  unlock_price_usdc?: string | null;
  created_at: string;
  completed_at?: string | null;
  error?: string | null;
  extra?: Record<string, unknown>;
}

export interface PortfolioSamplesResponse {
  success: boolean;
  samples: PortfolioSample[];
  error?: string;
}

export interface GeneratePortfolioSamplesResponse extends PortfolioSamplesResponse {
  queued: number;
  message?: string;
}

export const portfolioSamplesService = {
  list: async (): Promise<PortfolioSamplesResponse> => {
    const { data } = await api.get('/api/portfolio-samples');
    return data;
  },

  generateCryptoSaas: async (): Promise<GeneratePortfolioSamplesResponse> => {
    const { data } = await api.post('/api/portfolio-samples/crypto-saas', {});
    return data;
  },
};
