// YouTube clipping feature types

export interface SourceChannel {
  id: string;
  user_id: string;
  channel_id: string;
  channel_title: string;
  channel_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSourceChannelRequest {
  channel_url: string;
}

export interface UpdateSourceChannelRequest {
  is_active?: boolean;
}

export interface ChannelLinkage {
  id: string;
  user_id: string;
  source_channel_id: string;
  destination_channel_id: string;
  min_clip_duration_seconds: number;
  max_clip_duration_seconds: number;
  clips_per_video: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Populated fields (when fetched from API with JOINs)
  source_channel_name?: string;
  destination_channel_name?: string;
  stats?: {
    clips_generated: number;
    clips_posted: number;
  };
}

export interface CreateLinkageRequest {
  source_channel_id: string;
  destination_channel_id: string;
  min_clip_duration_seconds: number;
  max_clip_duration_seconds: number;
  clips_per_video: number;
}

export interface UpdateLinkageRequest {
  min_clip_duration_seconds?: number;
  max_clip_duration_seconds?: number;
  clips_per_video?: number;
  is_active?: boolean;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'no_clips_found';

export interface ClippingJob {
  id: string;
  user_id: string;
  linkage_id: string;
  source_video_id: string;
  source_video_title: string;
  status: JobStatus;
  progress: number; // 0-100
  current_step: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Real-time progress fields (populated from WebSocket ProgressUpdate)
  steps_completed?: number;
  total_steps?: number;
  current_action_detail?: string | null;
  // Populated fields
  linkage?: ChannelLinkage;
}

export interface ClippingProgressUpdate {
  job_id: string;
  timestamp: string;
  message: string;
  status: {
    status: 'running' | 'completed' | 'failed' | 'queued';
    current_step?: string;
    progress_percent?: number;
    steps_completed?: number;
    total_steps?: number;
    current_action_detail?: string | null;
    result?: string;
    error?: string;
  };
}

export interface JobFilters {
  status?: JobStatus;
  linkage_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export interface ExtractedClip {
  id: string;
  job_id: string;
  user_id: string;
  linkage_id: string;
  destination_channel_id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail_url: string | null;
  local_video_path: string;
  start_time_seconds: number;
  end_time_seconds: number;
  duration_seconds: number;
  upload_status: UploadStatus;
  youtube_video_id: string | null;
  youtube_url: string | null;
  ai_confidence_score: number | null;
  viral_factors: string[] | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  uploaded_at: string | null;
  updated_at: string;
}

export interface ClipFilters {
  upload_status?: UploadStatus;
  linkage_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ClippingAccessResponse {
  has_access: boolean;
}
