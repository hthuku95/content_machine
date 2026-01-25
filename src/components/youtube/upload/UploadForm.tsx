import { useState } from 'react';
import { Box, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, Alert, FormHelperText } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useConnectedChannels } from '@/hooks/useConnectedChannels';

export interface UploadFormData {
  channel_id: number;
  title: string;
  description?: string;
  privacy_status: 'public' | 'private' | 'unlisted';
  category?: string;
  tags?: string[];
  video_file: File;
}

export interface UploadFormProps {
  onSubmit: (data: UploadFormData) => void;
  isUploading: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function UploadForm({ onSubmit, isUploading }: UploadFormProps) {
  const { channels } = useConnectedChannels();

  const [channelId, setChannelId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'private' | 'unlisted'>('private');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setErrors({ ...errors, video_file: 'Please select a video file' });
        return;
      }
      setVideoFile(file);
      setErrors({ ...errors, video_file: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!channelId || channelId === 0) {
      newErrors.channel_id = 'Please select a channel';
    }
    if (!title || title.trim().length === 0) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title is too long (max 100 characters)';
    }
    if (description && description.length > 5000) {
      newErrors.description = 'Description is too long (max 5000 characters)';
    }
    if (!videoFile) {
      newErrors.video_file = 'Please select a video file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!videoFile) return;

    onSubmit({
      channel_id: channelId,
      title: title.trim(),
      description: description.trim() || undefined,
      privacy_status: privacyStatus,
      category: category || undefined,
      tags: [],
      video_file: videoFile,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <FormControl fullWidth error={!!errors.channel_id}>
          <InputLabel>Channel</InputLabel>
          <Select
            value={channelId}
            onChange={(e) => {
              setChannelId(Number(e.target.value));
              setErrors({ ...errors, channel_id: '' });
            }}
            disabled={isUploading || channels.length === 0}
          >
            <MenuItem value={0}>Select a channel...</MenuItem>
            {channels.map((ch) => (
              <MenuItem key={ch.id} value={ch.id}>
                {ch.channel_name}
              </MenuItem>
            ))}
          </Select>
          {errors.channel_id && <FormHelperText>{errors.channel_id}</FormHelperText>}
          {channels.length === 0 && (
            <FormHelperText>No channels connected. Please connect a YouTube channel first.</FormHelperText>
          )}
        </FormControl>

        <Box>
          <Button variant="outlined" component="label" fullWidth disabled={isUploading}>
            Choose Video File
            <input type="file" hidden accept="video/*" onChange={handleFileChange} />
          </Button>
          {videoFile && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Selected: {videoFile.name} ({formatBytes(videoFile.size)})
            </Alert>
          )}
          {errors.video_file && (
            <FormHelperText error>{errors.video_file}</FormHelperText>
          )}
        </Box>

        <TextField
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors({ ...errors, title: '' });
          }}
          error={!!errors.title}
          helperText={errors.title || 'Max 100 characters'}
          disabled={isUploading}
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors({ ...errors, description: '' });
          }}
          error={!!errors.description}
          helperText={errors.description || 'Max 5000 characters'}
          disabled={isUploading}
          multiline
          rows={4}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Privacy</InputLabel>
          <Select
            value={privacyStatus}
            onChange={(e) => setPrivacyStatus(e.target.value as typeof privacyStatus)}
            disabled={isUploading}
          >
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="unlisted">Unlisted</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Category (Optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
          helperText="YouTube category (e.g., 22 for People & Blogs)"
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isUploading || !videoFile || channels.length === 0}
          startIcon={<CloudUploadIcon />}
        >
          Start Upload
        </Button>
      </Stack>
    </Box>
  );
}
