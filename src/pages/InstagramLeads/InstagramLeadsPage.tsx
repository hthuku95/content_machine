import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Chip, CircularProgress, Snackbar, Alert, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, InputLabel,
  InputAdornment, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TagIcon from '@mui/icons-material/Tag';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import {
  instagramLeadsService,
  InstagramLead,
} from '@/services/instagramLeads.service';

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  new:       'default',
  contacted: 'primary',
  replied:   'warning',
  converted: 'success',
  skipped:   'error',
};

function formatFollowers(n: number | null): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function InstagramLeadsPage() {
  const [hashtag, setHashtag] = useState('');
  const [maxPosts, setMaxPosts] = useState(50);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  const [leads, setLeads] = useState<InstagramLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHashtag, setFilterHashtag] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [dmDialog, setDmDialog] = useState<{ open: boolean; lead: InstagramLead | null; generating: boolean; text: string }>({
    open: false, lead: null, generating: false, text: '',
  });

  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'success',
  });

  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnack({ open: true, message, severity });

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instagramLeadsService.listLeads({
        hashtag:        filterHashtag || undefined,
        contact_status: filterStatus  || undefined,
        limit: 100,
      });
      if (res.success) setLeads(res.leads);
    } catch {
      showSnack('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterHashtag, filterStatus]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const handleSearch = async () => {
    if (!hashtag.trim()) return;
    setSearching(true);
    setSearchMsg(null);
    try {
      const res = await instagramLeadsService.searchByHashtag(
        hashtag.trim(), maxPosts,
      );
      if (res.success) {
        setSearchMsg(res.message ?? 'Search launched!');
        showSnack(`PhantomBuster launched for #${hashtag} — check back in ~5 min`, 'info');
      } else {
        showSnack(res.error ?? 'Search failed', 'error');
      }
    } catch (err: any) {
      showSnack(err?.response?.data?.error ?? 'Search failed', 'error');
    } finally {
      setSearching(false);
    }
  };

  const openDmDialog = (lead: InstagramLead) => {
    setDmDialog({ open: true, lead, generating: false, text: lead.dm_script ?? '' });
  };

  const generateDm = async () => {
    if (!dmDialog.lead) return;
    setDmDialog(d => ({ ...d, generating: true }));
    try {
      const res = await instagramLeadsService.generateDm(dmDialog.lead.id);
      if (res.success && res.dm_script) {
        setDmDialog(d => ({ ...d, generating: false, text: res.dm_script! }));
        setLeads(ls => ls.map(l => l.id === dmDialog.lead!.id ? { ...l, dm_script: res.dm_script! } : l));
      } else {
        showSnack(res.error ?? 'Generation failed', 'error');
        setDmDialog(d => ({ ...d, generating: false }));
      }
    } catch {
      showSnack('DM generation failed', 'error');
      setDmDialog(d => ({ ...d, generating: false }));
    }
  };

  const copyDm = () => {
    if (dmDialog.text) {
      navigator.clipboard.writeText(dmDialog.text);
      showSnack('DM copied to clipboard!');
    }
  };

  const updateStatus = async (lead: InstagramLead, status: InstagramLead['contact_status']) => {
    try {
      await instagramLeadsService.updateContactStatus(lead.id, status);
      setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, contact_status: status } : l));
    } catch {
      showSnack('Failed to update status', 'error');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#dbd8e3' }}>
          Instagram Lead Finder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Discover Instagram creators by hashtag using PhantomBuster, then send personalised cold DMs.
        </Typography>
      </Box>

      {/* Search card */}
      <Card sx={{ mb: 3, bgcolor: '#352f44', border: '1px solid #5c5470' }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#dbd8e3' }}>
            Search by Hashtag
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <TextField
              label="Hashtag"
              placeholder="e.g. contentcreator"
              value={hashtag}
              onChange={e => setHashtag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              size="small"
              sx={{ minWidth: 220 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TagIcon sx={{ fontSize: 16, color: '#5c5470' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Max profiles"
              type="number"
              value={maxPosts}
              onChange={e => setMaxPosts(Number(e.target.value))}
              size="small"
              sx={{ width: 140 }}
              inputProps={{ min: 10, max: 200, step: 10 }}
            />
            <Button
              variant="contained"
              startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={searching || !hashtag.trim()}
              sx={{ bgcolor: '#5c5470', '&:hover': { bgcolor: '#7a7090' } }}
            >
              {searching ? 'Launching…' : 'Launch Search'}
            </Button>
          </Box>
          {searchMsg && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {searchMsg}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
            PhantomBuster scrapes Instagram for profiles posting under this hashtag. Results appear below in ~5–10 minutes.
          </Typography>
        </CardContent>
      </Card>

      {/* Filters + results */}
      <Card sx={{ bgcolor: '#352f44', border: '1px solid #5c5470' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#dbd8e3', flexGrow: 1 }}>
              Leads {leads.length > 0 && `(${leads.length})`}
            </Typography>
            <TextField
              label="Filter by hashtag"
              size="small"
              value={filterHashtag}
              onChange={e => setFilterHashtag(e.target.value)}
              sx={{ width: 180 }}
            />
            <FormControl size="small" sx={{ width: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={e => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {['new', 'contacted', 'replied', 'converted', 'skipped'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button size="small" onClick={loadLeads} disabled={loading}>
              {loading ? <CircularProgress size={14} /> : 'Refresh'}
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : leads.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PeopleIcon sx={{ fontSize: 48, color: '#5c5470', mb: 1 }} />
              <Typography color="text.secondary">
                No leads yet. Launch a hashtag search above to discover creators.
              </Typography>
            </Box>
          ) : (
            <Paper sx={{ overflow: 'auto', bgcolor: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#9999bb' }}>Creator</TableCell>
                    <TableCell sx={{ color: '#9999bb' }}>Followers</TableCell>
                    <TableCell sx={{ color: '#9999bb' }}>Hashtag</TableCell>
                    <TableCell sx={{ color: '#9999bb' }}>Status</TableCell>
                    <TableCell sx={{ color: '#9999bb' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map(lead => (
                    <TableRow key={lead.id} sx={{ '&:hover': { bgcolor: 'rgba(92,84,112,0.15)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={lead.profile_pic_url ?? undefined}
                            sx={{ width: 32, height: 32, bgcolor: '#5c5470', fontSize: 14 }}
                          >
                            {lead.username?.[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              @{lead.username}
                              {lead.is_verified && (
                                <Chip label="✓" size="small" sx={{ ml: 0.5, height: 16, fontSize: 10, bgcolor: '#2563eb' }} />
                              )}
                            </Typography>
                            {lead.full_name && (
                              <Typography variant="caption" color="text.secondary">{lead.full_name}</Typography>
                            )}
                            {lead.bio && (
                              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {lead.bio}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#dbd8e3' }}>
                          {formatFollowers(lead.followers_count)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {lead.hashtag_source && (
                          <Chip label={`#${lead.hashtag_source}`} size="small" sx={{ bgcolor: '#2a2438', color: '#dbd8e3', fontSize: 11 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" variant="standard">
                          <Select
                            value={lead.contact_status}
                            onChange={e => updateStatus(lead, e.target.value as InstagramLead['contact_status'])}
                            disableUnderline
                            sx={{ fontSize: 12 }}
                          >
                            {(['new', 'contacted', 'replied', 'converted', 'skipped'] as const).map(s => (
                              <MenuItem key={s} value={s}>
                                <Chip label={s} size="small" color={STATUS_COLORS[s]} sx={{ fontSize: 11 }} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Generate cold DM">
                            <IconButton size="small" onClick={() => openDmDialog(lead)} sx={{ color: '#dbd8e3' }}>
                              <AutoFixHighIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {lead.profile_url && (
                            <Tooltip title="Open Instagram profile">
                              <IconButton size="small" component="a" href={lead.profile_url} target="_blank" rel="noopener" sx={{ color: '#9999bb' }}>
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
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* DM Dialog */}
      <Dialog open={dmDialog.open} onClose={() => setDmDialog(d => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2a2438', color: '#dbd8e3' }}>
          Cold DM — @{dmDialog.lead?.username}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#2a2438', pt: '12px !important' }}>
          {dmDialog.text ? (
            <Box
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                fontSize: 14, color: '#dbd8e3', bgcolor: '#1a1825', p: 2,
                borderRadius: 1, border: '1px solid #5c5470', m: 0,
              }}
            >
              {dmDialog.text}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No DM script yet. Click "Generate DM" to create one with AI.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#2a2438', gap: 1 }}>
          <Button onClick={() => setDmDialog(d => ({ ...d, open: false }))} color="inherit">
            Close
          </Button>
          <Button
            startIcon={dmDialog.generating ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon />}
            onClick={generateDm}
            disabled={dmDialog.generating}
            variant="outlined"
            sx={{ borderColor: '#5c5470', color: '#dbd8e3' }}
          >
            {dmDialog.generating ? 'Generating…' : 'Generate DM'}
          </Button>
          {dmDialog.text && (
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={copyDm}
              variant="contained"
              sx={{ bgcolor: '#5c5470', '&:hover': { bgcolor: '#7a7090' } }}
            >
              Copy
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
