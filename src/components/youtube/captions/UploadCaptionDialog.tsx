import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Box,
  Typography,
  Alert,
  FormHelperText,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Subtitles as SubtitlesIcon } from '@mui/icons-material';
import { useCaptionActions } from '@/hooks/useCaptions';

export interface UploadCaptionDialogProps {
  open: boolean;
  videoId: string;
  videoTitle?: string;
  onClose: () => void;
}

export function UploadCaptionDialog({ open, videoId, videoTitle, onClose }: UploadCaptionDialogProps) {
  const { uploadCaption, isUploading } = useCaptionActions(videoId);

  const [language, setLanguage] = useState('');
  const [name, setName] = useState('');
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.srt', '.vtt', '.sbv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError('Please select a valid caption file (.srt, .vtt, or .sbv)');
      return;
    }

    setError(null);
    setCaptionFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!language || language.length < 2) {
      setError('Please enter a valid language code (e.g., en, es, fr)');
      return;
    }

    if (!captionFile) {
      setError('Please select a caption file');
      return;
    }

    uploadCaption(
      { language, caption_file: captionFile, name: name || undefined },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: () => {
          setError('Failed to upload caption');
        },
      }
    );
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setLanguage('');
      setName('');
      setCaptionFile(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Caption</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {videoTitle && (
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload captions for <strong>{videoTitle}</strong>
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              label="Language Code"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setError(null);
              }}
              disabled={isUploading}
              placeholder="en"
              helperText="Enter ISO 639-1 language code (e.g., en for English, es for Spanish)"
              fullWidth
              required
            />

            <TextField
              label="Caption Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUploading}
              placeholder="English Subtitles"
              helperText="Optional display name for the caption track"
              fullWidth
            />

            <Box>
              <Button variant="outlined" component="label" fullWidth disabled={isUploading} startIcon={<SubtitlesIcon />}>
                Choose Caption File
                <input type="file" hidden accept=".srt,.vtt,.sbv" onChange={handleFileChange} />
              </Button>
              {captionFile && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Selected: {captionFile.name}
                </Typography>
              )}
              <FormHelperText>Supported formats: .srt, .vtt, .sbv</FormHelperText>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUploading || !language || !captionFile}
            startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
          >
            {isUploading ? 'Uploading...' : 'Upload Caption'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
