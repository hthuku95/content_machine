import api from './api';

export interface ManualClip {
  id: string;
  clip_number: number;
  title?: string;
  description?: string;
  start_time_seconds?: number;
  end_time_seconds?: number;
  duration_seconds?: number;
  quality_score?: number;
  download_url?: string;
  thumbnail_url?: string;
  url_expires_at?: string;
}

export interface ManualClippingJob {
  id: string;
  video_url: string;
  video_platform: string;
  video_title?: string;
  workflow_id?: string;
  clips_requested: number;
  status: 'pending' | 'analyzing' | 'downloading' | 'extracting' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  progress_percent: number;
  clips_count: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ManualClippingJobDetail extends ManualClippingJob {
  clips: ManualClip[];
}

const manualClippingService = {
  async createJob(
    videoUrl: string,
    clipsCount = 3,
    minDuration = 30,
    maxDuration = 120,
  ): Promise<{ job_id: string; workflow_id?: string; status: string }> {
    const res = await api.post('/api/manual-clipping/jobs', {
      video_url: videoUrl,
      clips_count: clipsCount,
      min_duration: minDuration,
      max_duration: maxDuration,
    });
    return res.data;
  },

  async listJobs(page = 1): Promise<ManualClippingJob[]> {
    const res = await api.get(`/api/manual-clipping/jobs?page=${page}`);
    return res.data.jobs ?? [];
  },

  async getJob(jobId: string): Promise<ManualClippingJobDetail> {
    const res = await api.get(`/api/manual-clipping/jobs/${jobId}`);
    return { ...res.data.job, clips: res.data.clips ?? [] };
  },

  async cancelJob(jobId: string): Promise<void> {
    await api.delete(`/api/manual-clipping/jobs/${jobId}`);
  },
};

export default manualClippingService;
