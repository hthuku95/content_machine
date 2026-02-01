import { api } from './api';
import type {
  ClippingAccessResponse,
  SourceChannel,
  CreateSourceChannelRequest,
  UpdateSourceChannelRequest,
  ChannelLinkage,
  CreateLinkageRequest,
  UpdateLinkageRequest,
  ClippingJob,
  JobFilters,
  ExtractedClip,
  ClipFilters,
} from '@/types/clipping.types';

export const clippingService = {
  /**
   * Check if user has access to clipping features
   */
  async checkAccess(): Promise<ClippingAccessResponse> {
    const response = await api.get<ClippingAccessResponse>('/api/clipping/access-check');
    return response.data;
  },

  // ===== Source Channels =====

  /**
   * Get all source channels for the user
   */
  async listSourceChannels(): Promise<SourceChannel[]> {
    const response = await api.get<{ success: boolean; channels: SourceChannel[] }>(
      '/api/clipping/source-channels'
    );
    // Ensure we always return an array, even if the API response is malformed
    const channels = response.data?.channels;
    return Array.isArray(channels) ? channels : [];
  },

  /**
   * Add a new source channel
   */
  async addSourceChannel(data: CreateSourceChannelRequest): Promise<SourceChannel> {
    const response = await api.post<SourceChannel>('/api/clipping/source-channels', data);
    return response.data;
  },

  /**
   * Update a source channel
   */
  async updateSourceChannel(
    id: string,
    data: UpdateSourceChannelRequest
  ): Promise<SourceChannel> {
    const response = await api.patch<SourceChannel>(
      `/api/clipping/source-channels/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a source channel
   */
  async removeSourceChannel(id: string): Promise<void> {
    await api.delete(`/api/clipping/source-channels/${id}`);
  },

  // ===== Linkages =====

  /**
   * Get all linkages for the user
   */
  async listLinkages(): Promise<ChannelLinkage[]> {
    try {
      const response = await api.get<{ success: boolean; linkages: ChannelLinkage[] }>(
        '/api/clipping/linkages'
      );
      console.log('[clippingService.listLinkages] Response:', response.data);
      // Ensure we always return an array, even if the API response is malformed
      const linkages = response.data?.linkages;
      if (!Array.isArray(linkages)) {
        console.error('[clippingService.listLinkages] Invalid linkages data:', linkages);
        return [];
      }
      return linkages;
    } catch (error) {
      console.error('[clippingService.listLinkages] Error fetching linkages:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  /**
   * Create a new linkage
   */
  async createLinkage(data: CreateLinkageRequest): Promise<ChannelLinkage> {
    const response = await api.post<ChannelLinkage>('/api/clipping/linkages', data);
    return response.data;
  },

  /**
   * Update a linkage
   */
  async updateLinkage(id: string, data: UpdateLinkageRequest): Promise<ChannelLinkage> {
    const response = await api.patch<ChannelLinkage>(`/api/clipping/linkages/${id}`, data);
    return response.data;
  },

  /**
   * Delete a linkage
   */
  async deleteLinkage(id: string): Promise<void> {
    await api.delete(`/api/clipping/linkages/${id}`);
  },

  // ===== Jobs =====

  /**
   * Get all jobs with optional filters
   */
  async listJobs(filters?: JobFilters): Promise<ClippingJob[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.linkage_id) params.append('linkage_id', filters.linkage_id);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get<{ success: boolean; jobs: ClippingJob[] }>(
      `/api/clipping/jobs?${params.toString()}`
    );
    // Ensure we always return an array, even if the API response is malformed
    const jobs = response.data?.jobs;
    return Array.isArray(jobs) ? jobs : [];
  },

  /**
   * Get a specific job by ID (includes associated clips)
   */
  async getJobStatus(id: string): Promise<{ job: ClippingJob; clips: ExtractedClip[] }> {
    const response = await api.get<{
      success: boolean;
      job: ClippingJob;
      clips: ExtractedClip[];
    }>(`/api/clipping/jobs/${id}`);
    const clips = response.data?.clips;
    return {
      job: response.data.job,
      clips: Array.isArray(clips) ? clips : [],
    };
  },

  /**
   * Get job details (returns just the job, not clips)
   */
  async getJobDetail(id: string): Promise<ClippingJob> {
    const result = await this.getJobStatus(id);
    return result.job;
  },

  /**
   * Cancel a running job
   */
  async cancelJob(id: string): Promise<void> {
    await api.post(`/api/clipping/jobs/${id}/cancel`);
  },

  // ===== Clips =====

  /**
   * Get all clips with optional filters
   */
  async listClips(filters?: ClipFilters): Promise<ExtractedClip[]> {
    const params = new URLSearchParams();
    if (filters?.upload_status) params.append('upload_status', filters.upload_status);
    if (filters?.linkage_id) params.append('linkage_id', filters.linkage_id);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get<{ success: boolean; clips: ExtractedClip[] }>(
      `/api/clipping/clips?${params.toString()}`
    );
    // Ensure we always return an array, even if the API response is malformed
    const clips = response.data?.clips;
    return Array.isArray(clips) ? clips : [];
  },

  /**
   * Get a specific clip by ID
   */
  async getClipDetails(id: string): Promise<ExtractedClip> {
    const response = await api.get<{ success: boolean; clip: ExtractedClip }>(
      `/api/clipping/clips/${id}`
    );
    return response.data.clip;
  },

  /**
   * Get clip detail (alias for getClipDetails)
   */
  async getClipDetail(id: string): Promise<ExtractedClip> {
    return this.getClipDetails(id);
  },

  /**
   * Repost a clip
   */
  async repostClip(id: string): Promise<void> {
    await api.post(`/api/clipping/clips/${id}/repost`);
  },
};
