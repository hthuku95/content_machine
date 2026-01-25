/**
 * YouTube Resumable Upload Types
 *
 * Type definitions for resumable video upload operations
 */

export interface InitiateResumableUploadRequest {
  channel_id: number;
  video_path: string;
  title: string;
  description?: string;
  privacy_status: 'public' | 'private' | 'unlisted';
  category?: string;
  tags?: string[];
  file_size: number;
}

export interface ResumableUploadSession {
  upload_id: number;
  session_url: string;
  total_bytes: number;
}

export interface UploadProgress {
  uploaded_bytes: number;
  total_bytes: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  video_id?: string;
}
