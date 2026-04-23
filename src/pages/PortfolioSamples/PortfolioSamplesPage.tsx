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
  Stack,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as GenerateIcon,
  CollectionsBookmark as PortfolioIcon,
  OpenInNew as OpenIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { portfolioSamplesService } from '@/services/portfolioSamples.service';
import type { PortfolioSample } from '@/services/portfolioSamples.service';

type StatusColor = 'success' | 'error' | 'warning' | 'info';

const statusColor = (status: string): StatusColor => {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'running') return 'warning';
  return 'info';
};

export function PortfolioSamplesPage() {
  const [samples, setSamples] = useState<PortfolioSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSamples = async () => {
    setError(null);
    try {
      const response = await portfolioSamplesService.list();
      if (!response.success) {
        throw new Error(response.error || 'Unable to load portfolio samples');
      }
      setSamples(response.samples || []);
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
      setMessage(response.message || `Queued ${response.queued} samples.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to queue portfolio samples');
      setMessage(null);
    } finally {
      setGenerating(false);
    }
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

      {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
            const outputUrl = sample.output_r2_url || sample.preview_r2_url;
            return (
              <Card
                key={sample.id}
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {sample.company || sample.title}
                    </Typography>
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
                  {sample.source_url && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Source:{' '}
                      <Link href={sample.source_url} target="_blank" rel="noreferrer">
                        {sample.source_url}
                      </Link>
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Unlock price: {sample.unlock_price_usdc ? `$${sample.unlock_price_usdc} USDC` : 'default'}
                  </Typography>
                  {sample.error && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {sample.error}
                    </Alert>
                  )}
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    endIcon={<OpenIcon />}
                    href={sample.delivery_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Delivery
                  </Button>
                  {outputUrl && (
                    <Button
                      size="small"
                      endIcon={<OpenIcon />}
                      href={outputUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Output
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
