import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Chip, CircularProgress, Snackbar, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  CloudUpload as R2Icon,
} from '@mui/icons-material';
import { adminService } from '@/services/admin.service';
import type { Delivery } from '@/types/admin.types';
import { SERVICE_LABELS } from '@/constants/adminServices';
import { getErrorMessage } from '@/utils/errors';

const statusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  if (status === 'completed' || status === 'succeeded') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'running' || status === 'rendering' || status === 'processing') return 'warning';
  if (status === 'pending' || status === 'queued') return 'info';
  return 'default';
};

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const GIG_TYPE_OPTIONS = [
  'landing_page',
  'education',
  'manim_explainer',
  'whiteboard_animation',
  'kinetic_typography',
  'animated_infographic',
  'algorithm_viz',
  'investor_pitch',
  'year_in_review',
  'isometric_explainer',
  'clipping',
  'thumbnail',
  'scene',
  'ui_mockup',
];

export function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    gig_type: 'landing_page',
    prompt: '',
    source_url: '',
  });

  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success',
  });

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnack({ open: true, message, severity });

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      setDeliveries(await adminService.listDeliveries());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    // Auto-refresh every 30s so render progress + status update live.
    const t = setInterval(() => { load(true); }, 15_000);
    return () => clearInterval(t);
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.prompt.trim()) {
      showSnack('Title and prompt are required', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await adminService.createDelivery({
        title: form.title.trim(),
        gig_type: form.gig_type,
        prompt: form.prompt.trim(),
        style: 'modern',
        duration: 15,
        extra: form.source_url.trim() ? { source_url: form.source_url.trim() } : undefined,
      });
      if (!res.delivery_id && !res.delivery && res.error) {
        showSnack(res.error, 'error');
        return;
      }
      showSnack(`Delivery ${res.delivery_id ?? ''} created — rendering started.`, 'success');
      setCreateOpen(false);
      setForm({ title: '', gig_type: 'landing_page', prompt: '', source_url: '' });
      load(true);
    } catch (err) {
      showSnack(getErrorMessage(err, 'Failed to create delivery'), 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.secondary' }}>
            Deliveries
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            All render jobs + sample packs. View R2 output URLs and live workflow progress.
            For the Website-URL→Video bundles, pick <b>landing_page</b> and paste the customer's site URL.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`${deliveries.length} shown`} size="small" sx={{ bgcolor: 'background.default', color: 'text.secondary' }} />
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => load(true)}
            disabled={refreshing}
          >
            Refresh
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ bgcolor: '#7a4cff', '&:hover': { bgcolor: '#6a3def' } }}
          >
            New Delivery
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ overflow: 'auto', bgcolor: 'transparent' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Title</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Type</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Created</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Output</TableCell>
                <TableCell sx={{ color: 'text.secondary' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.disabled', py: 4 }}>
                    No deliveries yet.
                  </TableCell>
                </TableRow>
              )}
              {deliveries.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary' }}>
                      {d.title}
                    </Typography>
                    {d.client_ref && (
                      <Typography variant="caption" color="text.disabled">{d.client_ref}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={d.display_gig_type || SERVICE_LABELS[d.gig_type] || d.gig_type}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip label={d.status} size="small" color={statusColor(d.status)} sx={{ fontSize: 10, height: 18 }} />
                      {d.workflow_progress?.current_step ? (
                        <Typography variant="caption" color="text.disabled" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.workflow_progress.current_step}
                        </Typography>
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{formatDate(d.created_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    {d.output_r2_url ? (
                      <Tooltip title={d.output_r2_url}>
                        <Chip
                          component="a"
                          href={d.output_r2_url}
                          target="_blank"
                          rel="noopener"
                          icon={<R2Icon sx={{ fontSize: 14 }} />}
                          label="R2"
                          size="small"
                          clickable
                          color="success"
                          variant="outlined"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ fontSize: 11 }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {d.output_r2_url && (
                        <Tooltip title="Open output">
                          <IconButton size="small" component="a" href={d.output_r2_url} target="_blank" rel="noopener" sx={{ color: 'text.secondary' }}>
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {deliveries.some((d) => ['pending', 'running', 'rendering', 'processing', 'queued'].includes(d.status)) && (
            <LinearProgress sx={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} />
          )}
        </Paper>
      )}

      {/* Create delivery dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'text.secondary' }}>Create New Delivery</DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper', pt: '12px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
              size="small"
              placeholder="e.g. Hero video for Acme SaaS"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Gig type</InputLabel>
              <Select
                label="Gig type"
                value={form.gig_type}
                onChange={(e) => setForm((f) => ({ ...f, gig_type: e.target.value }))}
              >
                {GIG_TYPE_OPTIONS.map((g) => (
                  <MenuItem key={g} value={g}>{SERVICE_LABELS[g] || g}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Source website URL (optional)"
              value={form.source_url}
              onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
              fullWidth
              size="small"
              placeholder="https://customer.com"
            />
            <TextField
              label="Prompt / brief"
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              fullWidth
              multiline
              minRows={4}
              size="small"
              placeholder="Describe the buyer-facing video to generate..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.paper' }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={creating}
            sx={{ bgcolor: 'primary.main' }}
          >
            {creating ? 'Queuing…' : 'Create & Render'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}