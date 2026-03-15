import { api } from './api';

export interface ToolResult {
  success: boolean;
  message: string;
  output_file_id: string | null;
  download_url: string | null;
}

export interface StabilizeRequest {
  input_file: string;
  shakiness?: number;   // 1–10, default 5
  accuracy?: number;    // 1–15, default 10
  smoothing?: number;   // 1–100, default 10
  zoom?: number;        // 0.0 = no zoom, positive = zoom in
}

export interface ConvertFormatRequest {
  input_file: string;
  format: string; // mp4 | mkv | webm | mov | avi | ts | mp3 | aac | flac | wav | m4a
}

export interface AudioVisualizeRequest {
  input_file: string;
  mode?: 'waveform' | 'spectrum' | 'cqt';
  width?: number;
  height?: number;
}

export interface WorkflowRequest {
  input_file: string;
  workflow: 'youtube_ready' | 'podcast_cleanup' | 'cinematic_grade' | 'talking_head_cleanup' | 'create_gif';
  // create_gif only
  start_seconds?: number;
  duration_seconds?: number;
  gif_width?: number;
  gif_fps?: number;
}

export const toolsService = {
  async stabilize(req: StabilizeRequest): Promise<ToolResult> {
    const res = await api.post<ToolResult>('/api/tools/stabilize', req);
    return res.data;
  },

  async convertFormat(req: ConvertFormatRequest): Promise<ToolResult> {
    const res = await api.post<ToolResult>('/api/tools/convert', req);
    return res.data;
  },

  async visualizeAudio(req: AudioVisualizeRequest): Promise<ToolResult> {
    const res = await api.post<ToolResult>('/api/tools/visualize-audio', req);
    return res.data;
  },

  async runWorkflow(req: WorkflowRequest): Promise<ToolResult> {
    const res = await api.post<ToolResult>('/api/tools/workflow', req);
    return res.data;
  },
};
