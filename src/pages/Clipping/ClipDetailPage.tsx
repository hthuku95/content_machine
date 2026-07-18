import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Breadcrumbs,
  Link,
  GridLegacy as Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Chip,
  Collapse,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  Replay as ReplayIcon,
  Error as ErrorIcon,
  VideoLibrary as VideoIcon,
  Share as ShareIcon,
  AutoFixHigh as EnhanceIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { AccessGate } from '@/components/clipping/AccessGate';
import { ClipVideoPlayer } from '@/components/clipping/ClipVideoPlayer';
import { ClipMetadataCard } from '@/components/clipping/ClipMetadataCard';
import { ClipComparisonCard } from '@/components/clipping/analytics/ClipComparisonCard';
import { useClipDetail } from '@/hooks/useClipDetail';
import { useClips } from '@/hooks/useClips';
import { PATHS } from '@/routes/paths';

export function ClipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: clip, isLoading, error, repostClip, isReposting } = useClipDetail(id!);
  const { clips: allClips } = useClips();
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  // Calculate averages for comparison
  const uploadedClips = allClips.filter(c => c.upload_status === 'uploaded');
  const averageViews = uploadedClips.length > 0
    ? uploadedClips.reduce((sum, c) => sum + c.views_count, 0) / uploadedClips.length
    : 0;
  const averageLikes = uploadedClips.length > 0
    ? uploadedClips.reduce((sum, c) => sum + c.likes_count, 0) / uploadedClips.length
    : 0;
  const averageEngagement = uploadedClips.length > 0
    ? uploadedClips.reduce((sum, c) => {
        return sum + (c.views_count > 0 ? (c.likes_count / c.views_count) * 100 : 0);
      }, 0) / uploadedClips.length
    : 0;

  const handleCopyUrl = () => {
    if (clip?.youtube_url) {
      navigator.clipboard.writeText(clip.youtube_url);
      setCopySnackbarOpen(true);
    }
  };

  const handleShare = async () => {
    if (!clip?.youtube_url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.title,
          text: clip.description,
          url: clip.youtube_url,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy
      handleCopyUrl();
    }
  };

  const handleRepost = () => {
    if (window.confirm('Are you sure you want to repost this clip?')) {
      repostClip();
    }
  };

  if (isLoading) {
    return (
      <AccessGate>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AccessGate>
    );
  }

  if (error) {
    return (
      <AccessGate>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Failed to Load Clip
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {error instanceof Error ? error.message : 'An error occurred'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate(PATHS.CLIPPING.CLIPS)}
          >
            Back to Clips
          </Button>
        </Paper>
      </AccessGate>
    );
  }

  if (!clip) {
    return (
      <AccessGate>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <VideoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Clip Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The clip you're looking for doesn't exist or has been deleted.
          </Typography>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate(PATHS.CLIPPING.CLIPS)}
          >
            Back to Clips
          </Button>
        </Paper>
      </AccessGate>
    );
  }

  const canRepost = clip.upload_status === 'failed';

  return (
    <AccessGate>
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to={PATHS.CLIPPING.CLIPS} underline="hover">
            Clips
          </Link>
          <Typography color="text.primary">Clip Detail</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4" sx={{ flex: 1 }}>
            {clip.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate(PATHS.CLIPPING.CLIPS)}
            >
              Back
            </Button>
            {clip.youtube_url && (
              <>
                <Tooltip title="Copy URL">
                  <IconButton onClick={handleCopyUrl} color="primary">
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton onClick={handleShare} color="primary">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {canRepost && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ReplayIcon />}
                onClick={handleRepost}
                disabled={isReposting}
              >
                Repost
              </Button>
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column - Video & Description */}
          <Grid item xs={12} md={8}>
            {/* Video Player */}
            <Box sx={{ mb: 3 }}>
              <ClipVideoPlayer clip={clip} />
            </Box>

            {/* Description */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {clip.description}
              </Typography>

              {clip.youtube_url && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    YouTube URL
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Link
                      href={clip.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {clip.youtube_url}
                    </Link>
                    <Tooltip title="Copy URL">
                      <IconButton size="small" onClick={handleCopyUrl}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Metadata */}
          <Grid item xs={12} md={4}>
            <ClipMetadataCard clip={clip} />

            {/* Phase C+ Enhancement Status */}
            {(() => {
              if (clip.enhancement_applied && (clip.enhancement_tools?.length ?? 0) > 0) {
                return (
                  <Paper sx={{ p: 2, mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EnhanceIcon color="success" fontSize="small" />
                      <Chip label="AI Enhanced" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {clip.enhancement_tools!.map((tool) => (
                        <Chip key={tool} label={tool} size="small" variant="outlined" />
                      ))}
                    </Box>
                    {clip.enhancement_reasoning && (
                      <>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => setReasoningOpen((o) => !o)}
                        >
                          <Typography variant="caption" color="text.secondary">
                            AI reasoning
                          </Typography>
                          {reasoningOpen ? (
                            <ExpandLessIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                          ) : (
                            <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                          )}
                        </Box>
                        <Collapse in={reasoningOpen}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {clip.enhancement_reasoning}
                          </Typography>
                        </Collapse>
                      </>
                    )}
                  </Paper>
                );
              }
              // Fallback: old data that used the ai_tags tag pattern
              const legacyTag = (clip.tags ?? []).find((t) => t.startsWith('ai_enhanced_'));
              if (legacyTag) {
                const n = legacyTag.match(/ai_enhanced_(\d+)tools/)?.[1] ?? '?';
                return (
                  <Paper sx={{ p: 2, mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EnhanceIcon color="action" fontSize="small" />
                      <Chip label={`AI Enhanced (${n} tools)`} size="small" />
                    </Box>
                  </Paper>
                );
              }
              return null;
            })()}

            {/* Performance Comparison */}
            {clip.upload_status === 'uploaded' && uploadedClips.length > 1 && (
              <Box sx={{ mt: 3 }}>
                <ClipComparisonCard
                  clip={clip}
                  averageViews={averageViews}
                  averageLikes={averageLikes}
                  averageEngagement={averageEngagement}
                />
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Copy Snackbar */}
        <Snackbar
          open={copySnackbarOpen}
          autoHideDuration={3000}
          onClose={() => setCopySnackbarOpen(false)}
          message="URL copied to clipboard"
        />
      </Box>
    </AccessGate>
  );
}
