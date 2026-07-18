import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Image as ImageIcon } from '@mui/icons-material';
import { useVideos } from '@/hooks/useVideos';
import type { YouTubeVideo } from '@/types/video.types';

export interface ThumbnailUploadDialogProps {
  open: boolean;
  video: YouTubeVideo | null;
  onClose: () => void;
}

export function ThumbnailUploadDialog({ open, video, onClose }: ThumbnailUploadDialogProps) {
  const { uploadThumbnail, isUploadingThumbnail } = useVideos();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!video || !selectedFile) return;

    uploadThumbnail(
      { videoId: video.id, file: selectedFile },
      {
        onSuccess: () => {
          onClose();
          setSelectedFile(null);
          setPreviewUrl(null);
        },
        onError: () => {
          setError('Failed to upload thumbnail');
        },
      }
    );
  };

  const handleClose = () => {
    if (!isUploadingThumbnail) {
      onClose();
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Thumbnail</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload a custom thumbnail for <strong>{video?.title}</strong>
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Recommended: 1280x720 pixels (16:9 aspect ratio), max 2MB, JPG or PNG
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Button variant="outlined" component="label" fullWidth disabled={isUploadingThumbnail}>
            <ImageIcon sx={{ mr: 1 }} />
            Choose Image
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

          {previewUrl && (
            <Paper
              elevation={2}
              sx={{
                mt: 3,
                p: 1,
                position: 'relative',
                aspectRatio: '16/9',
                overflow: 'hidden',
              }}
            >
              <img
                src={previewUrl}
                alt="Thumbnail preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)}KB)
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isUploadingThumbnail}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploadingThumbnail || !!error}
          startIcon={isUploadingThumbnail ? <CircularProgress size={16} /> : <CloudUploadIcon />}
        >
          {isUploadingThumbnail ? 'Uploading thumbnail to YouTube' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
