import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Chip, CircularProgress, Snackbar, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AutoFixHigh as WandIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  OpenInNew as OpenInNewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminService } from '@/services/admin.service';
import type { Prospect } from '@/types/admin.types';
import { SERVICE_LABELS, PROSPECT_CONTACT_STATUSES, PROSPECT_PLATFORMS } from '@/constants/adminServices';
import { getErrorMessage } from '@/utils/errors';

function formatNum(n: number | null): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'info' | 'success' | 'error'> = {
  new: 'default',
  contacted: 'primary',
  replied: 'warning',
  interested: 'info',
  deal: 'success',
  converted: 'success',
  rejected: 'error',
};

export function AdminProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; prospect: Prospect | null; mode: 'dm' | 'outreach' | 'sample'; text: string }>({
    open: false, prospect: null, mode: 'dm', text: '',
  });

  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success',
  });

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnack({ open: true, message, severity });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProspects(await adminService.listProspects({
        platform: filterPlatform || undefined,
        contact_status: filterStatus || undefined,
        prospect_type: filterType || undefined,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prospects');
    } finally {
      setLoading(false);
    }
  }, [filterPlatform, filterStatus, filterType]);

  useEffect(() => { load(); }, [load]);

  const refreshRow = (id: string, patch: Partial<Prospect>) =>
    setProspects((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const handleRegenerateDm = async (prospect: Prospect) => {
    setBusyId(prospect.id);
    try {
      const res = await adminService.regenerateDm(prospect.id);
      if (res.success) {
        refreshRow(prospect.id, {
          x_dm_script: res.x_dm,
          email_script: res.email_script,
          service_type: res.service ?? prospect.service_type,
          ai_score: res.score ?? prospect.ai_score,
        });
        showSnack('DM + email regenerated');
      } else {
        showSnack(res.error ?? 'Regeneration failed', 'error');
      }
    } catch (err) {
      showSnack(getErrorMessage(err, 'Regeneration failed'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const openDialog = async (prospect: Prospect, mode: 'dm' | 'outreach') => {
    setDialog({ open: true, prospect, mode, text: mode === 'dm' ? (prospect.x_dm_script ?? '') : (prospect.email_script ?? '') });
    // Auto-generate if empty
    if (mode === 'dm' && !prospect.x_dm_script) {
      setBusyId(prospect.id);
      try {
        const res = await adminService.regenerateDm(prospect.id);
        if (res.success) {
          refreshRow(prospect.id, { x_dm_script: res.x_dm, email_script: res.email_script });
          setDialog((d) => ({ ...d, text: res.x_dm }));
        }
      } catch { /* shown on reload */ } finally {
        setBusyId(null);
      }
    }
    if (mode === 'outreach' && !prospect.email_script) {
      setBusyId(prospect.id);
      try {
        const res = await adminService.regenerateDm(prospect.id);
        if (res.success) {
          refreshRow(prospect.id, { x_dm_script: res.x_dm, email_script: res.email_script });
          setDialog((d) => ({ ...d, text: res.email_script }));
        }
      } catch { /* ignore */ } finally {
        setBusyId(null);
      }
    }
  };

  const handleOutreach = async () => {
    const p = dialog.prospect;
    if (!p) return;
    if (!p.sample_delivery_url) {
      showSnack('No sample link yet — generate a sample pack first', 'info');
      return;
    }
    setDialog((d) => ({ ...d, text: 'Generating…' }));
    try {
      const res = await adminService.generateOutreach(p.id, {
        delivery_url: `https://videosync.video${p.sample_delivery_url}`,
      });
      if (res.success) {
        refreshRow(p.id, { x_dm_script: res.x_dm, email_script: res.email_script });
        setDialog((d) => ({ ...d, text: res.email_script }));
        showSnack('Outreach generated (DM + email)');
      } else {
        showSnack(res.error ?? 'Generation failed', 'error');
        setDialog((d) => ({ ...d, open: false }));
      }
    } catch (err) {
      showSnack(getErrorMessage(err, 'Generation failed'), 'error');
      setDialog((d) => ({ ...d, open: false }));
    }
  };

  const handleGenerateSample = async (prospect: Prospect) => {
    setBusyId(prospect.id);
    try {
      const res = await adminService.generateSamplePack(prospect.id, {});
      if (res.success && res.delivery_id) {
        refreshRow(prospect.id, { sample_delivery_id: res.delivery_id, sample_delivery_url: `/delivery/${res.delivery_id}` });
        showSnack('Sample pack queued — rendering started. Link is shareable.', 'success');
      } else {
        showSnack(res.error ?? 'Sample generation failed', 'error');
      }
    } catch (err) {
      showSnack(getErrorMessage(err, 'Sample generation failed'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleSendEmail = async (prospect: Prospect) => {
    if (!prospect.business_email) {
      showSnack('No business email on this prospect', 'info');
      return;
    }
    setBusyId(prospect.id);
    try {
      const res = await adminService.sendEmail(prospect.id);
      if (res.success) {
        refreshRow(prospect.id, { contact_status: 'contacted' });
        showSnack(`Email sent to ${res.to}`);
      } else {
        showSnack(res.error ?? 'Send failed', 'error');
      }
    } catch (err) {
      showSnack(getErrorMessage(err, 'Send failed'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (prospect: Prospect, status: string) => {
    refreshRow(prospect.id, { contact_status: status });
    try {
      await adminService.updateProspect(prospect.id, { contact_status: status });
    } catch (err) {
      showSnack(getErrorMessage(err, 'Failed to update status'), 'error');
      load();
    }
  };

  const handleDelete = async (prospect: Prospect) => {
    if (!window.confirm(`Delete prospect ${prospect.display_name}?`)) return;
    setBusyId(prospect.id);
    try {
      await adminService.deleteProspect(prospect.id);
      setProspects((ps) => ps.filter((p) => p.id !== prospect.id));
      showSnack('Prospect deleted');
    } catch (err) {
      showSnack(getErrorMessage(err, 'Delete failed'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1500, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: 'text.secondary' }}>
          Prospects
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          AI-scored prospects across all platforms. Sort by revenue priority, generate DM/outreach,
          queue a free sample pack, and send the email. This is the core of the Website-URL→Video
          and Managed Campaign outreach engine.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Platform</InputLabel>
          <Select label="Platform" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {PROSPECT_PLATFORMS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {PROSPECT_CONTACT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: 170 }}>
          <InputLabel>Prospect type</InputLabel>
          <Select label="Prospect type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {['creator', 'business', 'educator', 'streamer', 'clipper'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
          Refresh
        </Button>
        <Chip label={`${prospects.length} prospects`} size="small" sx={{ bgcolor: 'background.default', color: 'text.secondary' }} />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ overflow: 'auto', bgcolor: 'transparent' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Creator</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Platform</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Service</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Score</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Audience</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Sample</TableCell>
                <TableCell sx={{ color: 'text.secondary' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prospects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', color: 'text.disabled', py: 4 }}>
                    No prospects found for these filters.
                  </TableCell>
                </TableRow>
              )}
              {prospects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: '#fff', fontSize: 14 }}>
                        {p.display_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary' }}>
                          {p.display_name}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.content_category ?? p.ai_reasoning ?? ''}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={p.platform} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} /></TableCell>
                  <TableCell>
                    {p.service_type ? (
                      <Chip label={SERVICE_LABELS[p.service_type] || p.service_type} size="small" sx={{ bgcolor: 'rgba(122,76,255,0.15)', color: '#a78bfa', fontSize: 10, height: 18 }} />
                    ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell>
                    {p.ai_score != null ? (
                      <Typography variant="body2" fontWeight={700} sx={{ color: p.ai_score >= 0.7 ? 'success.main' : p.ai_score >= 0.4 ? 'warning.main' : 'text.disabled' }}>
                        {Math.round(p.ai_score * 100)}
                      </Typography>
                    ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatNum(p.subscriber_count)}
                    </Typography>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <FormControl size="small" variant="standard">
                      <Select
                        value={p.contact_status}
                        onChange={(e) => handleStatusChange(p, e.target.value)}
                        disableUnderline
                        sx={{ fontSize: 12 }}
                      >
                        {PROSPECT_CONTACT_STATUSES.map((s) => (
                          <MenuItem key={s} value={s}>
                            <Chip label={s} size="small" color={STATUS_COLORS[s]} sx={{ fontSize: 10 }} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {p.sample_delivery_id ? (
                      <Chip
                        component="a"
                        href={`https://videosync.video${p.sample_delivery_url}`}
                        target="_blank"
                        rel="noopener"
                        label="Sample ✓"
                        size="small"
                        clickable
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    ) : (
                      <Button size="small" variant="text" sx={{ fontSize: 11, color: 'primary.main', minWidth: 0 }} onClick={(e) => { e.stopPropagation(); handleGenerateSample(p); }} disabled={busyId === p.id}>
                        {busyId === p.id ? <CircularProgress size={12} /> : '+ Queue sample'}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {busyId === p.id && <CircularProgress size={14} />}
                      <Tooltip title="Generate DM + email"><IconButton size="small" onClick={() => openDialog(p, 'dm')} sx={{ color: 'text.secondary' }}><WandIcon fontSize="small" /></IconButton></Tooltip>
                      {p.business_email && (
                        <Tooltip title="Send email (SES)"><IconButton size="small" onClick={() => handleSendEmail(p)} sx={{ color: 'text.secondary' }}><EmailIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                      {p.platform_url && (
                        <Tooltip title="Open platform profile"><IconButton size="small" component="a" href={p.platform_url} target="_blank" rel="noopener" sx={{ color: 'text.secondary' }}><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Prospect action dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'text.secondary' }}>
          {dialog.mode === 'dm' ? `Cold DM — ${dialog.prospect?.display_name}` : `Outreach — ${dialog.prospect?.display_name}`}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper', pt: '12px !important' }}>
          {dialog.mode === 'dm' ? (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                X DM (below 280 chars)
              </Typography>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: 14, color: 'text.secondary', bgcolor: 'background.default', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', m: 0 }}>
                {dialog.text || 'No DM yet. Click "Regenerate" to create one.'}
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Email script
              </Typography>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: 13, color: 'text.secondary', bgcolor: 'background.default', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', m: 0 }}>
                {dialog.prospect?.email_script || '—'}
              </Box>
            </>
          ) : (
            <>
              {!dialog.prospect?.sample_delivery_url && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No sample link yet. Generate a sample pack first (use the "+ Queue sample" button on the row) so the outreach can include a link.
                </Alert>
              )}
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: 14, color: 'text.secondary', bgcolor: 'background.default', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', m: 0 }}>
                {dialog.text || 'No email yet.'}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.paper', gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setDialog((d) => ({ ...d, open: false }))} color="inherit">Close</Button>
          <Box sx={{ flexGrow: 1 }} />
          {dialog.text && (
            <Button
              startIcon={<CopyIcon />}
              variant="outlined"
              onClick={() => { navigator.clipboard.writeText(dialog.text); showSnack('Copied!'); }}
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            >
              Copy
            </Button>
          )}
          {dialog.mode === 'dm' && (
            <Button
              startIcon={<WandIcon />}
              variant="outlined"
              disabled={busyId === dialog.prospect?.id}
              onClick={() => dialog.prospect && handleRegenerateDm(dialog.prospect)}
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            >
              Regenerate
            </Button>
          )}
          <Button
            startIcon={<EmailIcon />}
            variant="contained"
            disabled={!dialog.prospect?.sample_delivery_url}
            onClick={handleOutreach}
            sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}
          >
            Generate outreach
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