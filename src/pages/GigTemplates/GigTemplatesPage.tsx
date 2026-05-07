import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader,
  Chip, Button, Divider, Tooltip, IconButton, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Snackbar, Alert, Skeleton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { gigTemplatesService, GigTemplate, GigSample } from '@/services/gigTemplates.service';

// ─── Tier badge colors ────────────────────────────────────────────────────────
const TIER_COLORS = {
  basic:    { label: '#9999bb', border: '#3a3a5a', bg: '#13131e' },
  standard: { label: '#60a5fa', border: '#2a4a7a', bg: '#13131e' },
  premium:  { label: '#facc15', border: '#6a5a10', bg: '#13131e' },
};

// ─── Sample video slot ────────────────────────────────────────────────────────
function SampleSlot({ sample, onDelete }: { sample: GigSample | null; onDelete?: () => void }) {
  if (!sample) {
    return (
      <Box sx={{ aspectRatio: '16/9', bgcolor: '#0d0d18', border: '1px dashed #2a2a3a', borderRadius: 1,
                 display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.disabled">empty</Typography>
      </Box>
    );
  }

  const isImage = sample.filename?.endsWith('.png') || sample.filename?.endsWith('.jpg');
  const statusColor: Record<string, string> = {
    completed: '#4ade80', running: '#60a5fa', pending: '#9999bb', failed: '#f87171',
  };

  return (
    <Box sx={{ aspectRatio: '16/9', bgcolor: '#0d0d18', border: '1px solid #2a2a3a', borderRadius: 1,
               overflow: 'hidden', position: 'relative', '&:hover .sample-actions': { opacity: 1 } }}>
      {sample.status === 'completed' && sample.r2_url && (
        isImage
          ? <Box component="img" src={sample.r2_url} alt="sample" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Box component="video" src={sample.r2_url} muted autoPlay loop playsInline
                 sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {(sample.status === 'running' || sample.status === 'pending') && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      )}
      {/* Status bar */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.65)',
                 px: 0.75, py: 0.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: statusColor[sample.status] || '#999' }}>
          {sample.status}
        </Typography>
      </Box>
      {/* Hover actions */}
      <Box className="sample-actions" sx={{ position: 'absolute', top: 4, right: 4, opacity: 0, transition: 'opacity 0.15s', display: 'flex', gap: 0.5 }}>
        {onDelete && (
          <Tooltip title="Delete sample">
            <IconButton size="small" sx={{ bgcolor: 'rgba(220,38,38,0.8)', color: '#fff', p: 0.4 }}
                        onClick={onDelete}>
              <DeleteOutlineIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button size="small" variant="outlined" startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />}
            onClick={handleCopy}
            sx={{ fontSize: '0.7rem', px: 1, py: 0.3, borderColor: copied ? '#4ade80' : '#3a3a5a',
                 color: copied ? '#4ade80' : 'text.secondary', minWidth: 'unset', whiteSpace: 'nowrap' }}>
      {copied ? '✓ Copied' : label}
    </Button>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ template, onRefresh }: { template: GigTemplate; onRefresh: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [snack, setSnack] = useState('');

  const sampleCount = template.samples.length;
  const hasRunning = template.samples.some(s => s.status === 'running' || s.status === 'pending');
  const canGenerate = sampleCount < 5 && !hasRunning && !generating;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await gigTemplatesService.generateSample(template.id);
      onRefresh();
    } catch (e: any) {
      setSnack(e?.response?.data?.error || e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (sampleId: string) => {
    try {
      await gigTemplatesService.deleteSample(sampleId);
      onRefresh();
    } catch (e: any) {
      setSnack(e?.response?.data?.error || 'Delete failed');
    }
  };

  // Pad samples to 5 slots
  const slots: (GigSample | null)[] = [...template.samples.slice(0, 5)];
  while (slots.length < 5) slots.push(null);

  const tiers = [
    { key: 'basic',    label: 'Basic',    price: template.basic_price,    days: template.basic_delivery_days,    includes: template.basic_includes },
    { key: 'standard', label: 'Standard', price: template.standard_price, days: template.standard_delivery_days, includes: template.standard_includes },
    { key: 'premium',  label: 'Premium',  price: template.premium_price,  days: template.premium_delivery_days,  includes: template.premium_includes },
  ] as const;

  return (
    <Card sx={{ bgcolor: '#13131e', border: '1px solid #2a2a3a', borderRadius: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="white">{template.display_name}</Typography>
              <Typography variant="caption" color="text.secondary">{template.tagline}</Typography>
            </Box>
            <Chip label={template.service_type} size="small"
                  sx={{ bgcolor: '#6c5ce722', color: '#a99ef7', fontSize: '0.65rem', height: 22 }} />
          </Box>
        }
        sx={{ pb: 0, '& .MuiCardHeader-content': { width: '100%' } }}
      />
      <CardContent>

        {/* Pricing tiers */}
        <Typography variant="caption" sx={{ color: '#666680', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Pricing Tiers
        </Typography>
        <Table size="small" sx={{ mt: 1, mb: 2 }}>
          <TableHead>
            <TableRow>
              {tiers.map(t => (
                <TableCell key={t.key} align="center"
                           sx={{ border: 'none', pb: 0.5, color: TIER_COLORS[t.key].label, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  {t.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {tiers.map(t => (
                <TableCell key={t.key} align="center"
                           sx={{ border: `1px solid ${TIER_COLORS[t.key].border}`, bgcolor: TIER_COLORS[t.key].bg, borderRadius: 1 }}>
                  <Typography variant="h6" fontWeight={800} color="white">${t.price}</Typography>
                  <Typography variant="caption" color="text.disabled">{t.days}-day delivery</Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, fontSize: '0.65rem', color: '#9999bb', lineHeight: 1.4 }}>
                    {t.includes}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>

        {/* Gig titles */}
        <Typography variant="caption" sx={{ color: '#666680', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Gig Titles
        </Typography>
        <Box sx={{ mt: 1, mb: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {(template.gig_titles || []).map((title, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: '#0d0d18',
                               border: '1px solid #2a2a3a', borderRadius: 1, px: 1.5, py: 1 }}>
              <Typography variant="caption" sx={{ flex: 1, color: '#d0d0e8', fontSize: '0.75rem', lineHeight: 1.4 }}>
                {title}
              </Typography>
              <CopyButton text={title} />
            </Box>
          ))}
        </Box>

        {/* Keywords */}
        <Typography variant="caption" sx={{ color: '#666680', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Keywords
        </Typography>
        <Box sx={{ mt: 1, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {(template.keywords || []).map(kw => (
            <Chip key={kw} label={kw} size="small"
                  sx={{ bgcolor: '#1a1a2e', border: '1px solid #2a2a4a', color: '#9999cc', fontSize: '0.65rem', height: 20 }} />
          ))}
        </Box>

        {/* Description */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Typography variant="caption" sx={{ color: '#666680', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Gig Description
          </Typography>
          <CopyButton text={template.description} label="Copy Description" />
        </Box>
        <Paper variant="outlined" sx={{ bgcolor: '#0d0d18', border: '1px solid #2a2a3a', borderRadius: 1,
                                        p: 1.5, mb: 2, maxHeight: 140, overflowY: 'auto' }}>
          <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', color: '#b0b0cc', lineHeight: 1.7, fontSize: '0.72rem' }}>
            {template.description}
          </Typography>
        </Paper>

        {/* Sample videos */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#666680', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Sample Videos ({sampleCount}/5)
          </Typography>
          <Button size="small" variant="contained" startIcon={generating || hasRunning ? <CircularProgress size={12} color="inherit" /> : <AutoFixHighIcon sx={{ fontSize: 14 }} />}
                  disabled={!canGenerate}
                  onClick={handleGenerate}
                  sx={{ fontSize: '0.72rem', bgcolor: '#6c5ce7', '&:hover': { bgcolor: '#5a4bd1' }, '&:disabled': { opacity: 0.5 } }}>
            {generating || hasRunning ? 'Rendering…' : '+ Generate Sample'}
          </Button>
        </Box>
        <Grid container spacing={1}>
          {slots.map((s, i) => (
            <Grid item xs={12/5 * 5 > 12 ? 2.4 : 2.4} key={i} sx={{ width: '20%' }}>
              <SampleSlot sample={s} onDelete={s ? () => handleDelete(s.id) : undefined} />
            </Grid>
          ))}
        </Grid>
      </CardContent>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert severity="error" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function GigTemplatesPage() {
  const [templates, setTemplates] = useState<GigTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTemplates = useCallback(async () => {
    try {
      const data = await gigTemplatesService.list();
      setTemplates(data);
      setError('');
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
    // Auto-refresh every 8s if any sample is rendering
    const interval = setInterval(() => {
      const anyRunning = templates.some(t => t.samples.some(s => s.status === 'running' || s.status === 'pending'));
      if (anyRunning) loadTemplates();
    }, 8000);
    return () => clearInterval(interval);
  }, [loadTemplates, templates]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="white">Gig Templates</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Copy-paste ready Fiverr & People Per Hour gig info. Generate AI sample videos for your portfolio.
          </Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={loadTemplates} disabled={loading}
                sx={{ borderColor: '#3a3a5a', color: 'text.secondary' }}>
          ↻ Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={3}>
          {[1,2,3,4].map(i => <Grid item xs={12} md={6} key={i}><Skeleton variant="rounded" height={500} sx={{ bgcolor: '#1a1a2e' }} /></Grid>)}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {templates.map(t => (
            <Grid item xs={12} md={6} key={t.id}>
              <TemplateCard template={t} onRefresh={loadTemplates} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
