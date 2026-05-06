import { api } from '@/services/api';
import { config } from '@/config/config';

export interface PortfolioSample {
  id: string;
  delivery_id: string;
  delivery_url: string;
  public_delivery_url?: string | null;
  client_ref?: string | null;
  slug?: string | null;
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
  completed_in_seconds?: number | null;
  completed_in_minutes?: number | null;
  error?: string | null;
  portfolio_category?: string | null;
  sales_positioning?: string | null;
  visual_direction?: string | null;
  reference_image_url?: string | null;
  extra?: Record<string, unknown>;
}

export interface PortfolioTarget {
  slug: string;
  company: string;
  url: string;
  market?: string;
  angle?: string;
  visual_direction?: string;
}

export interface PortfolioSamplesResponse {
  success: boolean;
  samples: PortfolioSample[];
  targets?: PortfolioTarget[];
  error?: string;
}

export interface GeneratePortfolioSamplesResponse extends PortfolioSamplesResponse {
  queued: number;
  message?: string;
}

const toAbsoluteDeliveryUrl = (value?: string | null): string => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  const apiBase = config.apiBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  try {
    return new URL(value, apiBase).toString();
  } catch {
    return value;
  }
};

const normalizeSample = (sample: PortfolioSample): PortfolioSample => ({
  ...sample,
  delivery_url: toAbsoluteDeliveryUrl(sample.delivery_url),
  public_delivery_url: toAbsoluteDeliveryUrl(sample.public_delivery_url || sample.delivery_url) || null,
});

export const portfolioSamplesService = {
  list: async (): Promise<PortfolioSamplesResponse> => {
    const { data } = await api.get('/api/portfolio-samples');
    return {
      ...data,
      samples: Array.isArray(data.samples) ? data.samples.map(normalizeSample) : [],
    };
  },

  generateCryptoSaas: async (): Promise<GeneratePortfolioSamplesResponse> => {
    const { data } = await api.post('/api/portfolio-samples/crypto-saas', {});
    return {
      ...data,
      samples: Array.isArray(data.samples) ? data.samples.map(normalizeSample) : [],
    };
  },
};
