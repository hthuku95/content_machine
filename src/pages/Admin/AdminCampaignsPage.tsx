import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Chip, CircularProgress, Snackbar, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { adminService } from '@/services/admin.service';
import type { Campaign } from '@/types/admin.types';
import { SERVICE_LABELS } from '@/constants/adminServices';
import { getErrorMessage } from '@/utils/errors';

const statusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  if (status === 'active') return 'success';
  if (status === 'paused') return 'warning';
  if (status === 'cancelled' || status === 'completed') return 'default';
  if (status === 'pending_payment') return 'info';
  return 'default';
};

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success',
  });

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnack({ open: true, message, severity });

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setCampaigns(await adminService.listCampaigns());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setInterval(() => load(true), 30_000);
    return () => clearInterval(t);
  }, []);

  const doAction = async (campaign: Campaign, action: 'pause' | 'resume' | 'cancel') => {
    setBusyId(campaign.id);
    try {
      await adminService.campaignAction(campaign.id, action);
      setCampaigns((cs) => cs.map((c) => (c.id === campaign.id ? { ...c, status: action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'cancelled' } : c)));
      showSnack(`Campaign ${action === 'pause' ? 'paused' : action === 'resume' ? 'resumed' : 'cancelled'}`, 'success');
    } catch (err) {
      showSnack(getErrorMessage(err, `Failed to ${action} campaign`), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.secondary' }}>
            Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            All Managed Campaign state across the 12 services. Pause/resume/cancel auto-generation
            and posting. Active campaigns show published post counts.
          </Typography>
        </Box>
        <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => load(true)}>Refresh</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ overflow: 'auto', bgcolor: 'transparent' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Name</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Customer</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Service</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Posts</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Period</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Paid until</TableCell>
                <TableCell sx={{ color: 'text.secondary' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', color: 'text.disabled', py: 4 }}>
                    No campaigns yet.
                  </TableCell>
                </TableRow>
              )}
              {campaigns.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary' }}>{c.name}</Typography>
                    {c.source_url && (
                      <Typography variant="caption" color="text.disabled" sx={{ maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.source_url}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{c.user_email}</Typography>
                    <Typography variant="caption" color="text.disabled">id {c.user_id}</Typography>
                  </TableCell>
                  <TableCell><Chip label={SERVICE_LABELS[c.service_type] || c.service_type} size="small" sx={{ bgcolor: 'rgba(122,76,255,0.15)', color: '#a78bfa', fontSize: 10, height: 18 }} /></TableCell>
                  <TableCell><Chip label={c.status} size="small" color={statusColor(c.status)} sx={{ fontSize: 10, height: 18 }} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {c.total_posts_published} / {c.total_posts_planned}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(c.start_date)} → {formatDate(c.end_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color={c.paid_until ? 'text.secondary' : 'text.disabled'}>
                      {c.paid_until ? formatDate(c.paid_until) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      {busyId === c.id && <CircularProgress size={14} />}
                      {c.status === 'active' && (
                        <Tooltip title="Pause"><IconButton size="small" onClick={() => doAction(c, 'pause')} sx={{ color: 'warning.main' }}><PauseIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                      {(c.status === 'paused' || c.status === 'pending_payment') && (
                        <Tooltip title="Resume"><IconButton size="small" onClick={() => doAction(c, 'resume')} sx={{ color: 'success.main' }}><PlayIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                      {(c.status === 'active' || c.status === 'paused') && (
                        <Tooltip title="Cancel"><IconButton size="small" onClick={() => doAction(c, 'cancel')} sx={{ color: 'error.main' }}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {campaigns.some((c) => c.status === 'active') && (
            <LinearProgress sx={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} />
          )}
        </Paper>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}