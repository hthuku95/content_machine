import api from './api';

export interface GigSample {
  id: string;
  title: string;
  prompt_used: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  r2_url?: string;
  filename?: string;
  error?: string;
  created_at: string;
}

export interface GigTemplate {
  id: string;
  service_type: string;
  display_name: string;
  tagline: string;
  description: string;
  basic_price: number;
  basic_delivery_days: number;
  basic_includes: string;
  standard_price: number;
  standard_delivery_days: number;
  standard_includes: string;
  premium_price: number;
  premium_delivery_days: number;
  premium_includes: string;
  keywords: string[];
  gig_titles: string[];
  sample_prompts: string[];
  samples: GigSample[];
}

export const gigTemplatesService = {
  async list(): Promise<GigTemplate[]> {
    const { data } = await api.get('/api/gig-templates');
    return data.templates ?? [];
  },

  async generateSample(templateId: string): Promise<{ sample_id: string; prompt: string }> {
    const { data } = await api.post(`/api/gig-templates/${templateId}/generate-sample`);
    return data;
  },

  async deleteSample(sampleId: string): Promise<void> {
    await api.delete(`/api/gig-samples/${sampleId}`);
  },
};
