// Education-posting service (owner directive Nov 13-14 2026):
// topic ↔ channel linkages + generated-video job history.
// APIs are whitelist+admin gated on the backend (youtube_access middleware).

import api from './api';

export interface EducationLinkage {
  channel_db_id: number;
  channel_name: string;
  youtube_channel_id: string;
  topic: string;
  is_default_topic: boolean;
  linked_at?: string | null;
}

export interface EducationJob {
  id: string;
  topic: string;
  status: 'queued' | 'generating' | 'uploading' | 'completed' | 'failed';
  channel_name: string;
  youtube_url?: string | null;
  brief?: string | null;
  error?: string | null;
  created_at: string;
}

export const educationService = {
  async listLinkages(): Promise<EducationLinkage[]> {
    const response = await api.get<{ success: boolean; linkages: EducationLinkage[] }>(
      '/api/education/linkages'
    );
    return response.data.linkages ?? [];
  },

  async setTopic(channelDbId: number, topic: string): Promise<void> {
    await api.post(`/api/education/linkages/${channelDbId}`, { topic });
  },

  async getTopics(): Promise<string[]> {
    const response = await api.get<{ success: boolean; topics: string[]; default: string }>(
      '/api/education/topics'
    );
    return response.data.topics ?? ['History'];
  },

  async listJobs(limit = 50): Promise<EducationJob[]> {
    const response = await api.get<{ success: boolean; jobs: EducationJob[] }>(
      `/api/education/jobs?limit=${limit}`
    );
    return response.data.jobs ?? [];
  },
};
