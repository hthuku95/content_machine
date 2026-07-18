import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  TextField,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import {
  AutoAwesome as GenerateIcon,
  CollectionsBookmark as PortfolioIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Launch as LaunchIcon,
  OpenInNew as OpenIcon,
  Refresh as RefreshIcon,
  TravelExplore as ProspectIcon,
} from '@mui/icons-material';
import { portfolioSamplesService } from '@/services/portfolioSamples.service';
import type { PortfolioSample, PortfolioTarget } from '@/services/portfolioSamples.service';
import { PATHS } from '@/routes/paths';

type StatusColor = 'success' | 'error' | 'warning' | 'info';

const statusColor = (status: string): StatusColor => {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'running') return 'warning';
  return 'info';
};

export function PortfolioSamplesPage() {
  const [samples, setSamples] = useState<PortfolioSample[]>([]);
  const [targets, setTargets] = useState<PortfolioTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customProspect, setCustomProspect] = useState('');
  const [customBrief, setCustomBrief] = useState('');

  const loadSamples = async () => {
    setError(null);
    try {
      const response = await portfolioSamplesService.list();
      if (!response.success) {
        throw new Error(response.error || 'Unable to load portfolio samples');
      }
      setSamples(response.samples || []);
      setTargets(response.targets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load portfolio samples');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSamples();
  }, []);

  const generateSamples = async () => {
    setGenerating(true);
    setMessage('Queueing crypto SaaS samples...');
    setError(null);
    try {
      const response = await portfolioSamplesService.generateCryptoSaas();
      if (!response.success) {
        throw new Error(response.error || 'Unable to queue portfolio samples');
      }
      setSamples(response.samples || []);
      setTargets(response.targets || []);
      setMessage(response.message || `Queued ${response.queued} samples.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to queue portfolio samples');
      setMessage(null);
    } finally {
      setGenerating(false);
    }
  };

  const completed = samples.filter((sample) => sample.status === 'completed');
  const running = samples.filter((sample) => sample.status === 'running').length;
  const pending = samples.filter((sample) => sample.status === 'pending').length;
  const averageMinutes =
    completed.length > 0
      ? completed.reduce((sum, sample) => sum + (sample.completed_in_minutes || 0), 0) / completed.length
      : null;

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(successMessage);
      setError(null);
    } catch {
      setError('Unable to copy automatically on this browser. Open the delivery link and copy it manually.');
    }
  };

  const launchCustomSampleChat = () => {
    const brief = customBrief.trim();
    if (!brief) {
      setError('Add a short custom sample brief before launching the agent.');
      return;
    }

    const prompt = [
      'I need a custom portfolio sample for outbound sales.',
      '',
      customProspect.trim() ? `Target prospect or brand: ${customProspect.trim()}` : null,
      `Reference URL or media: ${customUrl.trim() || 'No URL supplied'}`,
      `Sample brief: ${brief}`,
      '',
      'Please generate one polished preview sample, explain your creative direction, and use the full VideoSync stack where appropriate.',
    ]
      .filter(Boolean)
      .join('\n');

    const params = new URLSearchParams({
      prompt,
      autosend: '1',
      source: 'portfolio-samples',
    });
    window.location.href = `${PATHS.AGENT_CHAT}?${params.toString()}`;
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <PortfolioIcon color="primary" />
            <Typography variant="h4" fontWeight={800}>
              Portfolio Samples
            </Typography>
          </Stack>
          <Typography color="text.secondary" maxWidth={780}>
            Shareable proof for outbound pitches. These crypto SaaS demos are speculative
            website-to-video samples that render through the same delivery pipeline clients use.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSamples}
            disabled={loading || generating}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={18} /> : <GenerateIcon />}
            onClick={generateSamples}
            disabled={generating}
          >
            Generate 5 Samples
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: 'Completed', value: completed.length },
          { label: 'Running', value: running },
          { label: 'Queued', value: pending },
          { label: 'Avg Render Time', value: averageMinutes ? `${averageMinutes.toFixed(1)} min` : 'Waiting' },
        ].map((item) => (
          <Paper
            key={item.label}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(244,247,251,0.92))',
            }}
          >
            <Typography variant="overline" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="primary.main">
            Custom Sample Studio
          </Typography>
          <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
            Generate a portfolio sample from scratch with the agent
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            The five crypto SaaS demos stay as the shared baseline set. Use this section when you need a more custom
            outbound sample for a different brand, creator, URL, or offer angle.
          </Typography>

          <Stack spacing={1.5}>
            <TextField
              label="Reference URL or media link"
              placeholder="https://example.com, YouTube/Twitch URL, or target landing page"
              value={customUrl}
              onChange={(event) => setCustomUrl(event.target.value)}
              fullWidth
            />
            <TextField
              label="Prospect or brand name"
              placeholder="Optional"
              value={customProspect}
              onChange={(event) => setCustomProspect(event.target.value)}
              fullWidth
            />
            <TextField
              label="Describe the custom sample"
              placeholder="Example: create a 20-second narrated landing-page hero with cleaner motion, stronger fintech styling, and a clearer CTA."
              value={customBrief}
              onChange={(event) => setCustomBrief(event.target.value)}
              multiline
              minRows={4}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Button variant="contained" startIcon={<GenerateIcon />} onClick={launchCustomSampleChat}>
                Open Agent Chat
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCustomUrl('');
                  setCustomProspect('');
                  setCustomBrief('');
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(34,197,94,0.08))',
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', lg: 'center' }}
          >
            <Box maxWidth={760}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <ProspectIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Pitch-ready positioning
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                Use the completed delivery links as speculative ads in cold outreach. The strongest opener is:
                “I made a short product video for your brand as a demo so you can judge execution, not promises.”
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current production throughput for this workflow is about {averageMinutes ? averageMinutes.toFixed(1) : '14'} minutes per render.
              </Typography>
            </Box>
            {targets.length > 0 && (
              <Box sx={{ minWidth: { lg: 320 }, width: '100%' }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                  Current crypto SaaS target set
                </Typography>
                <List dense disablePadding>
                  {targets.map((target) => (
                    <ListItem key={target.slug} disableGutters>
                      <ListItemText
                        primary={target.company}
                        secondary={`${target.market || 'crypto SaaS'}${target.angle ? ` — ${target.angle}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : samples.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No portfolio samples yet
            </Typography>
            <Typography color="text.secondary">
              Generate the first five crypto SaaS samples, then use their delivery links in
              cold DMs, partnership pitches, and freelance applications.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2.5,
          }}
        >
          {samples.map((sample) => {
            const downloadUrl = sample.output_r2_url || sample.preview_r2_url || '';
            const downloadName = `${sample.company || sample.title || 'videosync-sample'}`
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '') || 'videosync-sample';
            return (
              <Card
                key={sample.id}
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                {(sample.output_r2_url || sample.preview_r2_url) && (
                  <Box
                    component="video"
                    src={sample.output_r2_url || sample.preview_r2_url || undefined}
                    poster={sample.reference_image_url || undefined}
                    controls
                    preload="metadata"
                    sx={{
                      width: '100%',
                      aspectRatio: '16 / 9',
                      backgroundColor: 'black',
                    }}
                  />
                )}
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography variant="overline" color="primary.main">
                        {sample.portfolio_category || 'portfolio sample'}
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {sample.company || sample.title}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={sample.status}
                      color={statusColor(sample.status)}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {sample.title}
                  </Typography>
                  {sample.visual_direction && (
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      <strong>Creative angle:</strong> {sample.visual_direction}
                    </Typography>
                  )}
                  {sample.source_url && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Source:</strong>{' '}
                      <Link href={sample.source_url} target="_blank" rel="noreferrer">
                        {sample.source_url}
                      </Link>
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Free sample — no payment required
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Render time: {sample.completed_in_minutes ? `${sample.completed_in_minutes.toFixed(1)} min` : 'In progress'}
                  </Typography>
                  {sample.sales_positioning && (
                    <Paper
                      variant="outlined"
                      sx={{
                        mt: 2,
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(2, 132, 199, 0.04)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Outbound positioning
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {sample.sales_positioning}
                      </Typography>
                    </Paper>
                  )}
                  {sample.error && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {sample.error}
                    </Alert>
                  )}
                </CardContent>
                <Divider />
                <CardActions sx={{ px: 2, py: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    size="small"
                    endIcon={<OpenIcon />}
                    href={sample.internal_delivery_url || sample.public_delivery_url || sample.delivery_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Delivery
                  </Button>
                  <Button
                    size="small"
                    endIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(sample.public_delivery_url || sample.delivery_url, `${sample.company || sample.title} share link copied.`)}
                  >
                    Copy Link
                  </Button>
                  {sample.source_url && (
                    <Button
                      size="small"
                      endIcon={<LaunchIcon />}
                      href={sample.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Website
                    </Button>
                  )}
                  {downloadUrl && (
                    <Button
                      size="small"
                      endIcon={<DownloadIcon />}
                      href={downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={`${downloadName}.mp4`}
                    >
                      Download
                    </Button>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
