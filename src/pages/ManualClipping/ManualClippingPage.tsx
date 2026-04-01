import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Card, CardContent,
  CardMedia, Chip, CircularProgress, Alert, Slider, Divider,
  LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import RefreshIcon from '@mui/icons-material/Refresh';
import manualClippingService, { ManualClippingJob, ManualClippingJobDetail } from '../../services/manualClipping.service';

const ACTIVE_STATUSES = ['pending', 'analyzing', 'downloading', 'extracting', 'uploading'];

function statusColor(status: string): 'default' | 'warning' | 'success' | 'error' {
  if (ACTIVE_STATUSES.includes(status)) return 'warning';
  if (status === 'completed') return 'success';
  if (status === 'failed' || status === 'cancelled') return 'error';
  return 'default';
}

function ClipCard({ clip }: { clip: ManualClippingJobDetail['clips'][number] }) {
  const dur = clip.duration_seconds ? Math.round(clip.duration_seconds) + 's' : '';
  const score = clip.quality_score ? Math.round(clip.quality_score * 100) + '%' : '';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {clip.thumbnail_url ? (
        <CardMedia component="img" image={clip.thumbnail_url} alt={clip.title ?? 'clip'} sx={{ aspectRatio: '16/9', objectFit: 'cover' }} />
      ) : (
        <Box sx={{ aspectRatio: '16/9', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ContentCutIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="body2" noWrap fontWeight={600} title={clip.title ?? ''}>
          {clip.title ?? `Clip ${clip.clip_number}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {[dur, score].filter(Boolean).join(' · ')}
        </Typography>
      </CardContent>
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        {clip.download_url ? (
          <Button
            variant="contained"
            color="success"
            fullWidth
            size="small"
            startIcon={<DownloadIcon />}
            href={clip.download_url}
            download
            target="_blank"
            rel="noreferrer"
          >
            Download
          </Button>
        ) : (
          <Typography variant="caption" color="text.disabled">Link expired</Typography>
        )}
      </Box>
    </Card>
  );
}

function JobRow({ job, onCancel, onLoadClips }: {
  job: ManualClippingJob;
  onCancel: (id: string) => void;
  onLoadClips: (id: string) => void;
}) {
  const isActive = ACTIVE_STATUSES.includes(job.status);
  const platform = job.video_platform === 'twitch' ? 'TWITCH' : 'YOUTUBE';
  const platformColor = job.video_platform === 'twitch' ? '#9147ff' : '#ff4444';

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 400 }}>
              {job.video_title ?? job.video_url}
            </Typography>
            <Chip label={platform} size="small" sx={{ fontSize: '0.68rem', color: platformColor, borderColor: platformColor }} variant="outlined" />
            <Chip label={job.status.toUpperCase()} size="small" color={statusColor(job.status)} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {new Date(job.created_at).toLocaleString()}
            {job.error_message && <span style={{ color: '#ef4444', marginLeft: 8 }}>{job.error_message}</span>}
          </Typography>
          {isActive && (
            <LinearProgress
              variant={job.progress_percent > 0 ? 'determinate' : 'indeterminate'}
              value={job.progress_percent}
              sx={{ mt: 0.75, height: 3, borderRadius: 2 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          {job.status === 'completed' && (
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => onLoadClips(job.id)}>
              Clips
            </Button>
          )}
          {isActive && (
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={() => onCancel(job.id)}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function ManualClippingPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [clipsCount, setClipsCount] = useState(3);
  const [minDuration, setMinDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(120);
  const [jobs, setJobs] = useState<ManualClippingJob[]>([]);
  const [expandedClips, setExpandedClips] = useState<Record<string, ManualClippingJobDetail>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const refreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const list = await manualClippingService.listJobs();
      setJobs(list);
      // Keep auto-refreshing if any active jobs
      const hasActive = list.some(j => ACTIVE_STATUSES.includes(j.status));
      if (hasActive) {
        refreshRef.current = setTimeout(loadJobs, 5000);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadJobs();
    return () => { if (refreshRef.current) clearTimeout(refreshRef.current); };
  }, [loadJobs]);

  async function handleSubmit() {
    if (!videoUrl.trim()) { setError('Please enter a video URL'); return; }
    setSubmitting(true);
    setError('');
    try {
      await manualClippingService.createJob(videoUrl.trim(), clipsCount, minDuration, maxDuration);
      setSuccess('Job created! AI is analyzing the video…');
      setVideoUrl('');
      setTimeout(() => setSuccess(''), 4000);
      loadJobs();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    try {
      await manualClippingService.cancelJob(id);
      loadJobs();
    } catch {
      setError('Could not cancel job');
    }
  }

  async function handleLoadClips(id: string) {
    try {
      const detail = await manualClippingService.getJob(id);
      setExpandedClips(prev => ({ ...prev, [id]: detail }));
    } catch {
      setError('Failed to load clips');
    }
  }

  const platformHint = videoUrl.includes('twitch.tv')
    ? '🎮 Twitch VOD — will be downloaded then analyzed'
    : videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
    ? '▶ YouTube — AI analyzes directly via URL'
    : '';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ContentCutIcon /> Manual Clipping
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Paste any YouTube or Twitch URL. The AI finds the best moments and generates download-ready clips — no destination channel required.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Submit form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Clip a Video</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              placeholder="Paste YouTube or Twitch URL here"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              size="small"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : <ContentCutIcon />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Clip It
            </Button>
          </Box>
          {platformHint && <Typography variant="caption" color="primary.light">{platformHint}</Typography>}

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Clips to extract: <b>{clipsCount}</b>
              </Typography>
              <Slider value={clipsCount} min={1} max={5} step={1} marks onChange={(_, v) => setClipsCount(v as number)} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Min length: <b>{minDuration}s</b>
              </Typography>
              <Slider value={minDuration} min={10} max={120} step={5} onChange={(_, v) => setMinDuration(v as number)} size="small" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Max length: <b>{maxDuration}s</b>
              </Typography>
              <Slider value={maxDuration} min={30} max={300} step={10} onChange={(_, v) => setMaxDuration(v as number)} size="small" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Jobs list */}
      <Card>
        <CardContent sx={{ pb: '8px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Your Jobs</Typography>
            <IconButton size="small" onClick={loadJobs} title="Refresh"><RefreshIcon fontSize="small" /></IconButton>
          </Box>
        </CardContent>
        {jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, color: 'text.disabled' }}>
            <ContentCutIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">No jobs yet. Paste a URL above to get started.</Typography>
          </Box>
        ) : (
          <>
            {jobs.map(job => (
              <React.Fragment key={job.id}>
                <JobRow job={job} onCancel={handleCancel} onLoadClips={handleLoadClips} />
                {expandedClips[job.id] && (
                  <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Grid container spacing={1.5}>
                      {expandedClips[job.id].clips.map(clip => (
                        <Grid item xs={6} sm={4} md={3} key={clip.id}>
                          <ClipCard clip={clip} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </Card>
    </Box>
  );
}
