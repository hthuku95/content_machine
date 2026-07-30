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
  Link,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesome as GenerateIcon,
  CollectionsBookmark as PortfolioIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { portfolioSamplesService, type PortfolioSample, type DfyServiceDef } from '@/services/portfolioSamples.service';

type StatusColor = 'success' | 'error' | 'warning' | 'info' | 'default';

const statusColor = (status: string): StatusColor => {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'running') return 'warning';
  if (status === 'pending') return 'info';
  return 'default';
};

const serviceTypeLabel: Record<string, string> = {
  clipping: 'Clipping',
  kick_auto_clipper: 'Kick Auto-Clipper',
  landing_page: 'Landing Page Hero',
  education: 'Education',
  manim_explainer: 'Manim Explainer',
  whiteboard_animation: 'Whiteboard Animation',
  kinetic_typography: 'Kinetic Typography',
  animated_infographic: 'Animated Infographic',
  algorithm_viz: 'Algorithm Viz',
  investor_pitch: 'Investor Pitch',
  year_in_review: 'Year in Review',
  isometric_explainer: 'Isometric Explainer',
};

export function PortfolioSamplesPage() {
  const [samples, setSamples] = useState<PortfolioSample[]>([]);
  const [dfyServices, setDfyServices] = useState<DfyServiceDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSamples = async () => {
    setError(null);
    try {
      const response = await portfolioSamplesService.listDfy();
      if (!response.success) {
        throw new Error(response.error || 'Unable to load portfolio samples');
      }
      setSamples(response.samples || []);
      setDfyServices(response.dfy_services || []);
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
    setMessage('Queueing all DFY service samples...');
    setError(null);
    try {
      const response = await portfolioSamplesService.generateDfy();
      if (!response.success) {
        throw new Error(response.error || 'Unable to queue portfolio samples');
      }
      setSamples(response.samples || []);
      setMessage(response.message || `Queued ${response.queued} samples.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to queue portfolio samples');
      setMessage(null);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage('Copied!');
      setError(null);
    } catch {
      setError('Unable to copy automatically.');
    }
  };

  const sampleBySlug = (slug: string): PortfolioSample | undefined =>
    samples.find((s) => s.client_ref?.includes(slug) || s.title?.toLowerCase().includes(slug));

  const completed = samples.filter((s) => s.status === 'completed').length;
  const running = samples.filter((s) => s.status === 'running').length;
  const failed = samples.filter((s) => s.status === 'failed').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            <PortfolioIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Portfolio Samples
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Share these samples as proof-of-work in DMs and emails. All 12 DFY services shown below.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
            <Chip icon={<CheckIcon />} label={`${completed} done`} color="success" size="small" variant="outlined" />
            {running > 0 && <Chip icon={<CircularProgress size={12} />} label={`${running} running`} color="warning" size="small" variant="outlined" />}
            {failed > 0 && <Chip icon={<ErrorIcon />} label={`${failed} failed`} color="error" size="small" variant="outlined" />}
          </Box>
          <Tooltip title="Refresh">
            <IconButton onClick={loadSamples} size="small"><RefreshIcon /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {/* Generate button */}
      <Card sx={{ mb: 3, background: theme => theme.palette.mode === 'dark' ? '#2a2438' : undefined }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>Generate All Samples</Typography>
            <Typography variant="body2" color="text.secondary">
              Queues any missing DFY service samples for generation. Existing samples are skipped.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={generateSamples}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={16} /> : <GenerateIcon />}
            size="large"
          >
            {generating ? 'Generating...' : 'Generate Samples'}
          </Button>
        </CardContent>
      </Card>

      {/* Samples Table */}
      <Table component={Paper} variant="outlined" sx={{ '& td, & th': { px: 1.5, py: 1.5 } }}>
        <TableHead>
          <TableRow>
            <TableCell>Service</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>R2 URL</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dfyServices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography color="text.secondary" sx={{ py: 4 }}>
                  No DFY services loaded.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            dfyServices.map((svc) => {
              const sample = sampleBySlug(svc.slug);
              const status = sample?.status || 'pending';
              return (
                <TableRow key={svc.slug} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {serviceTypeLabel[svc.slug] || svc.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {svc.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ${svc.price_mo}/mo
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      color={statusColor(status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {sample?.output_r2_url ? (
                      <Link
                        href={sample.output_r2_url}
                        target="_blank"
                        rel="noopener"
                        sx={{ fontSize: '0.8rem', wordBreak: 'break-all' }}
                      >
                        {sample.output_r2_url.slice(0, 40)}...
                      </Link>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {sample?.output_r2_url && (
                        <>
                          <Tooltip title="Open">
                            <IconButton size="small" href={sample.output_r2_url} target="_blank">
                              <OpenIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy URL">
                            <IconButton size="small" onClick={() => copyToClipboard(sample.output_r2_url!)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Divider sx={{ my: 3 }} />

      {/* Price reference */}
      <Typography variant="caption" color="text.disabled">
        All samples are free (unlock_price_usdc = 0.0). Prices shown are the monthly campaign rate for each service.
        Share the R2 URL in your DMs and emails as a free first sample.
      </Typography>
    </Box>
  );
}
