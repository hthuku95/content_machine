import { useState } from 'react';
import { Box, Typography, Container, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useResumableUpload } from '@/hooks/useResumableUpload';
import { UploadForm, type UploadFormData } from '@/components/youtube/upload/UploadForm';
import { UploadProgress } from '@/components/youtube/upload/UploadProgress';
import { PATHS } from '@/routes/paths';
import type { UploadProgress as UploadProgressType } from '@/types/upload.types';

export function UploadPage() {
  console.log('[UploadPage] Component mounted');
  const navigate = useNavigate();
  const { initiateUploadAsync, uploadChunkAsync } = useResumableUpload();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: UploadFormData) => {
    console.log('[UploadPage] Starting upload with data:', {
      channel_id: data.channel_id,
      title: data.title,
      privacy_status: data.privacy_status,
      file_size: data.video_file.size,
      file_name: data.video_file.name,
    });

    setIsUploading(true);
    setError(null);

    try {
      console.log('[UploadPage] Initiating upload session...');
      // Initiate the upload session
      const session = await initiateUploadAsync({
        channel_id: data.channel_id,
        video_path: data.video_file.name,
        title: data.title,
        description: data.description,
        privacy_status: data.privacy_status,
        category: data.category,
        tags: data.tags,
        file_size: data.video_file.size,
      });

      console.log('[UploadPage] Upload session initiated:', {
        upload_id: session.upload_id,
        session_url: session.session_url,
        total_bytes: session.total_bytes,
      });

      // Upload file in chunks
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const totalChunks = Math.ceil(data.video_file.size / chunkSize);

      console.log('[UploadPage] Starting chunked upload:', {
        chunkSize,
        totalChunks,
        totalSize: data.video_file.size,
      });

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, data.video_file.size);
        const chunk = data.video_file.slice(start, end);

        console.log(`[UploadPage] Uploading chunk ${i + 1}/${totalChunks}:`, {
          start,
          end,
          chunkSize: chunk.size,
          percentage: ((end / data.video_file.size) * 100).toFixed(2) + '%',
        });

        try {
          const progress = await uploadChunkAsync({
            uploadId: session.upload_id,
            chunk,
            startByte: start,
            endByte: end - 1,
            totalBytes: data.video_file.size,
          });

          console.log(`[UploadPage] Chunk ${i + 1} uploaded successfully:`, progress);
          setUploadProgress(progress);

          if (progress.status === 'completed') {
            console.log('[UploadPage] Upload completed successfully, redirecting to uploads page');
            // Upload complete, redirect after a delay
            setTimeout(() => {
              navigate(PATHS.YOUTUBE.UPLOADS);
            }, 2000);
            break;
          }
        } catch (err: any) {
          // Extract detailed error message from API response
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'Failed to upload chunk. Please try again.';

          // If it's a YouTube auth error, show reconnect guidance
          const finalMessage =
            err.response?.status === 401 && errorMessage.includes('token')
              ? `${errorMessage}\n\nPlease reconnect your YouTube channel.`
              : errorMessage;

          setError(finalMessage);
          setUploadProgress({
            uploaded_bytes: end,
            total_bytes: data.video_file.size,
            percentage: (end / data.video_file.size) * 100,
            status: 'error',
            error_message: errorMessage,
            error_code: err.response?.status,
          });
          console.error('Upload chunk error:', err);
          break;
        }
      }
    } catch (err: any) {
      // Extract detailed error message from API response
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to initiate upload. Please try again.';

      setError(errorMessage);
      setUploadProgress(null);
      console.error('Upload initiation error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Video
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload a video to your YouTube channel
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!isUploading && !uploadProgress ? (
          <Paper sx={{ p: 3 }}>
            <UploadForm onSubmit={handleSubmit} isUploading={false} />
          </Paper>
        ) : (
          uploadProgress && <UploadProgress progress={uploadProgress} />
        )}
      </Box>
    </Container>
  );
}
