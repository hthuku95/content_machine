/**
 * YouTube Caption Management Types
 *
 * Type definitions for YouTube caption entities and operations
 */

export interface Caption {
  caption_id: string;
  language: string;
  name: string;
  track_kind: string;
  is_draft: boolean;
}

export interface UploadCaptionRequest {
  language: string;
  caption_file: File;
  name?: string;
}
