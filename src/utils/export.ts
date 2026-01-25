import type { ClippingJob, ExtractedClip, ChannelLinkage, SourceChannel } from '@/types/clipping.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  filename: string;
  format: ExportFormat;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV<T extends Record<string, any>>(data: T[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        let value = row[header];

        // Handle nested objects/arrays
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ];

  return csvRows.join('\n');
}

/**
 * Trigger download of a file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV or JSON
 */
export function exportData<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
): void {
  const { filename, format } = options;

  if (format === 'csv') {
    const csv = arrayToCSV(data);
    downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
  } else if (format === 'json') {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json;charset=utf-8;');
  }
}

/**
 * Export jobs with formatted data
 */
export function exportJobs(jobs: ClippingJob[], format: ExportFormat = 'csv'): void {
  const data = jobs.map(job => ({
    id: job.id,
    status: job.status,
    source_video_title: job.source_video_title,
    source_video_id: job.source_video_id,
    progress: job.progress,
    current_step: job.current_step || 'N/A',
    error_message: job.error_message || 'N/A',
    linkage_id: job.linkage_id,
    created_at: new Date(job.created_at).toLocaleString(),
    started_at: job.started_at ? new Date(job.started_at).toLocaleString() : 'N/A',
    completed_at: job.completed_at ? new Date(job.completed_at).toLocaleString() : 'N/A',
  }));

  exportData(data, {
    filename: `clipping-jobs-${new Date().toISOString().split('T')[0]}`,
    format,
  });
}

/**
 * Export clips with analytics
 */
export function exportClips(clips: ExtractedClip[], format: ExportFormat = 'csv'): void {
  const data = clips.map(clip => ({
    id: clip.id,
    title: clip.title,
    description: clip.description,
    duration_seconds: clip.duration_seconds,
    upload_status: clip.upload_status,
    youtube_url: clip.youtube_url || 'N/A',
    views_count: clip.views_count,
    likes_count: clip.likes_count,
    comments_count: clip.comments_count,
    engagement_rate: clip.views_count > 0
      ? ((clip.likes_count / clip.views_count) * 100).toFixed(2) + '%'
      : '0%',
    ai_confidence_score: clip.ai_confidence_score || 'N/A',
    tags: clip.tags?.join('; ') || '',
    viral_factors: clip.viral_factors?.join('; ') || '',
    created_at: new Date(clip.created_at).toLocaleString(),
    uploaded_at: clip.uploaded_at ? new Date(clip.uploaded_at).toLocaleString() : 'N/A',
  }));

  exportData(data, {
    filename: `clipping-clips-${new Date().toISOString().split('T')[0]}`,
    format,
  });
}

/**
 * Export linkages with stats
 */
export function exportLinkages(linkages: ChannelLinkage[], format: ExportFormat = 'csv'): void {
  const data = linkages.map(linkage => ({
    id: linkage.id,
    source_channel: linkage.source_channel?.channel_title || 'Unknown',
    destination_channel: linkage.destination_channel_title || 'Unknown',
    is_active: linkage.is_active ? 'Yes' : 'No',
    min_clip_duration_seconds: linkage.min_clip_duration_seconds,
    max_clip_duration_seconds: linkage.max_clip_duration_seconds,
    clips_per_video: linkage.clips_per_video,
    clips_generated: linkage.stats?.clips_generated || 0,
    clips_posted: linkage.stats?.clips_posted || 0,
    success_rate: linkage.stats
      ? `${((linkage.stats.clips_posted / (linkage.stats.clips_generated || 1)) * 100).toFixed(2)}%`
      : 'N/A',
    created_at: new Date(linkage.created_at).toLocaleString(),
  }));

  exportData(data, {
    filename: `clipping-linkages-${new Date().toISOString().split('T')[0]}`,
    format,
  });
}

/**
 * Export source channels
 */
export function exportSourceChannels(channels: SourceChannel[], format: ExportFormat = 'csv'): void {
  const data = channels.map(channel => ({
    id: channel.id,
    channel_title: channel.channel_title,
    channel_id: channel.channel_id,
    channel_url: channel.channel_url,
    is_active: channel.is_active ? 'Yes' : 'No',
    created_at: new Date(channel.created_at).toLocaleString(),
    updated_at: new Date(channel.updated_at).toLocaleString(),
  }));

  exportData(data, {
    filename: `source-channels-${new Date().toISOString().split('T')[0]}`,
    format,
  });
}

/**
 * Export analytics summary
 */
export interface AnalyticsSummary {
  total_linkages: number;
  active_linkages: number;
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  job_success_rate: string;
  total_clips: number;
  uploaded_clips: number;
  total_views: number;
  total_likes: number;
  avg_engagement_rate: string;
  generated_at: string;
}

export function exportAnalytics(summary: AnalyticsSummary, format: ExportFormat = 'json'): void {
  if (format === 'json') {
    const json = JSON.stringify(summary, null, 2);
    downloadFile(
      json,
      `analytics-summary-${new Date().toISOString().split('T')[0]}.json`,
      'application/json;charset=utf-8;'
    );
  } else {
    const csv = arrayToCSV([summary]);
    downloadFile(
      csv,
      `analytics-summary-${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv;charset=utf-8;'
    );
  }
}
