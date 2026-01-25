/**
 * ChunkUploadManager
 *
 * Utility class for managing chunked file uploads
 * Handles splitting files into chunks and tracking upload progress
 */

import type { UploadProgress } from '@/types/upload.types';

export interface ChunkUploadOptions {
  file: File;
  chunkSize?: number; // Default: 5MB
  onProgress?: (progress: UploadProgress) => void;
  onChunkUpload: (chunk: Blob, startByte: number, endByte: number, totalBytes: number) => Promise<void>;
}

export class ChunkUploadManager {
  private file: File;
  private chunkSize: number;
  private totalChunks: number;
  private uploadedChunks: number = 0;
  private onProgress?: (progress: UploadProgress) => void;
  private onChunkUpload: (chunk: Blob, startByte: number, endByte: number, totalBytes: number) => Promise<void>;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;

  constructor(options: ChunkUploadOptions) {
    this.file = options.file;
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024; // 5MB default
    this.totalChunks = Math.ceil(this.file.size / this.chunkSize);
    this.onProgress = options.onProgress;
    this.onChunkUpload = options.onChunkUpload;
  }

  async start(): Promise<void> {
    this.isPaused = false;
    this.isCancelled = false;

    for (let i = this.uploadedChunks; i < this.totalChunks; i++) {
      if (this.isCancelled) {
        throw new Error('Upload cancelled');
      }

      while (this.isPaused) {
        // Wait until resumed
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const chunk = this.file.slice(start, end);

      try {
        await this.onChunkUpload(chunk, start, end - 1, this.file.size);
        this.uploadedChunks++;

        // Report progress
        if (this.onProgress) {
          this.onProgress({
            uploaded_bytes: end,
            total_bytes: this.file.size,
            percentage: (end / this.file.size) * 100,
            status: 'uploading',
          });
        }
      } catch (error) {
        if (this.onProgress) {
          this.onProgress({
            uploaded_bytes: end,
            total_bytes: this.file.size,
            percentage: (end / this.file.size) * 100,
            status: 'error',
          });
        }
        throw error;
      }
    }

    // Upload complete
    if (this.onProgress) {
      this.onProgress({
        uploaded_bytes: this.file.size,
        total_bytes: this.file.size,
        percentage: 100,
        status: 'completed',
      });
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  cancel(): void {
    this.isCancelled = true;
  }

  getProgress(): number {
    return (this.uploadedChunks / this.totalChunks) * 100;
  }
}
