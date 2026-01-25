import { useState } from 'react';
import { Box, Typography, Container, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useResumableUpload } from '@/hooks/useResumableUpload';
import { UploadForm, type UploadFormData } from '@/components/youtube/upload/UploadForm';
import { UploadProgress } from '@/components/youtube/upload/UploadProgress';
import { PATHS } from '@/routes/paths';
import type { UploadProgress as UploadProgressType } from '@/types/upload.types';

export function UploadPage() {
  const navigate = useNavigate();
  const { initiateUploadAsync, uploadChunkAsync } = useResumableUpload();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: UploadFormData) => {
    setIsUploading(true);
    setError(null);

    try {
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

      // Upload file in chunks
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const totalChunks = Math.ceil(data.video_file.size / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, data.video_file.size);
        const chunk = data.video_file.slice(start, end);

        try {
          const progress = await uploadChunkAsync({
            uploadId: session.upload_id,
            chunk,
            startByte: start,
            endByte: end - 1,
            totalBytes: data.video_file.size,
          });

          setUploadProgress(progress);

          if (progress.status === 'completed') {
            // Upload complete, redirect after a delay
            setTimeout(() => {
              navigate(PATHS.YOUTUBE.UPLOADS);
            }, 2000);
            break;
          }
        } catch (err) {
          setError('Failed to upload chunk. Please try again.');
          setUploadProgress({
            uploaded_bytes: end,
            total_bytes: data.video_file.size,
            percentage: (end / data.video_file.size) * 100,
            status: 'error',
          });
          break;
        }
      }
    } catch (err) {
      setError('Failed to initiate upload. Please try again.');
      setUploadProgress(null);
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
