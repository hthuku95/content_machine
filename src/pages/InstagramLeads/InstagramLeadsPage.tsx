import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Chip, CircularProgress, Snackbar, Alert, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, InputLabel,
  InputAdornment, Divider, Tabs, Tab, LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TagIcon from '@mui/icons-material/Tag';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PeopleIcon from '@mui/icons-material/People';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import { instagramLeadsService } from '@/services/instagramLeads.service';
import type { InstagramLead } from '@/services/instagramLeads.service';

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  new:       'default',
  contacted: 'primary',
  replied:   'warning',
  converted: 'success',
  skipped:   'error',
};

const NICHE_OPTIONS = [
  { value: 'content creator',   label: 'Content Creator' },
  { value: 'youtuber',          label: 'YouTuber' },
  { value: 'podcaster',         label: 'Podcaster' },
  { value: 'online educator',   label: 'Online Educator / Course Creator' },
  { value: 'fitness coach',     label: 'Fitness Coach' },
  { value: 'business coach',    label: 'Business Coach' },
  { value: 'gaming streamer',   label: 'Gaming / Streamer' },
  { value: 'lifestyle blogger', label: 'Lifestyle Blogger' },
  { value: 'real estate',       label: 'Real Estate Agent' },
  { value: 'motivational speaker', label: 'Motivational Speaker' },
  // Niches for the newer service types — landing-page + product mockup
  { value: 'saas founder',      label: 'SaaS Founder / Indie Hacker' },
  { value: 'shopify store',     label: 'Shopify / Ecommerce Store' },
  { value: 'app developer',     label: 'Mobile App Developer' },
  { value: 'hardware startup',  label: 'Hardware / Kickstarter Creator' },
];

/// Service types the whitelisted user can pitch. Mirrors the Rust scorer
/// enum (src/handlers/prospects.rs) — the AI picks one automatically but
/// the dropdown lets the user override per lead.
const SERVICE_TYPE_OPTIONS: Array<{ value: NonNullable<InstagramLead['service_type']>; label: string; pitch: string }> = [
  { value: 'clipping',             label: '🎬 Clipping',              pitch: '$297/mo — daily clips from long-form content, auto-posted to your socials' },
  { value: 'kick_auto_clipper',    label: '⚡ Kick Auto-Clipper',     pitch: '$297/mo — daily clips from Kick streamers, auto-posted to your socials' },
  { value: 'education',           label: '📚 Education',             pitch: '$199/mo — daily Manim/LaTeX explainer videos, auto-posted to your socials' },
  { value: 'landing_page',         label: '🚀 Landing Page Hero',    pitch: '$149/mo — daily animated hero videos from your URL, auto-posted to your socials' },
  { value: 'manim_explainer',      label: '🎞️ Manim Explainer',     pitch: '$149/mo — daily Manim-animated explainers, auto-posted to your socials' },
  { value: 'whiteboard_animation', label: '✏️ Whiteboard Animation', pitch: '$149/mo — daily whiteboard explainers, auto-posted to your socials' },
  { value: 'kinetic_typography',   label: '🔤 Kinetic Typography',  pitch: '$149/mo — daily text-motion videos, auto-posted to your socials' },
  { value: 'animated_infographic', label: '📊 Animated Infographic', pitch: '$149/mo — daily data viz videos, auto-posted to your socials' },
  { value: 'algorithm_viz',        label: '💻 Algorithm Viz',        pitch: '$149/mo — daily algorithm visualization videos, auto-posted to your socials' },
  { value: 'investor_pitch',       label: '📈 Investor Pitch',      pitch: '$149/mo — daily pitch deck videos, auto-posted to your socials' },
  { value: 'year_in_review',       label: '📅 Year in Review',      pitch: '$149/mo — daily recap/wrapped-style videos, auto-posted to your socials' },
  { value: 'isometric_explainer',  label: '🏗️ Isometric Explainer', pitch: '$149/mo — daily isometric 3D explainers, auto-posted to your socials' },
];

function formatFollowers(n: number | null): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const color = score >= 80 ? 'success.main' : score >= 60 ? 'warning.main' : 'text.disabled';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <StarIcon sx={{ fontSize: 14, color }} />
      <Typography variant="body2" fontWeight={700} sx={{ color }}>{score}</Typography>
    </Box>
  );
}

function LeadsTable({
  leads,
  onDmClick,
  onStatusChange,
}: {
  leads: InstagramLead[];
  onDmClick: (lead: InstagramLead) => void;
  onStatusChange: (lead: InstagramLead, status: InstagramLead['contact_status']) => void;
}) {
  if (leads.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography color="text.secondary">No leads yet.</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ overflow: 'auto', bgcolor: 'transparent' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary' }}>Creator</TableCell>
            <TableCell sx={{ color: 'text.secondary' }}>Followers</TableCell>
            <TableCell sx={{ color: 'text.secondary' }}>Score</TableCell>
            <TableCell sx={{ color: 'text.secondary' }}>Hashtag</TableCell>
            <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
            <TableCell sx={{ color: 'text.secondary' }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map(lead => (
            <TableRow
              key={lead.id}
              hover
              onClick={() => onDmClick(lead)}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={lead.profile_pic_url ?? undefined}
                    sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: '#fff', fontSize: 14 }}
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
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.bio}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary' }}>
                  {formatFollowers(lead.followers_count)}
                </Typography>
              </TableCell>
              <TableCell><ScoreBadge score={(lead as any).score ?? null} /></TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {lead.hashtag_source && (
                    <Chip label={`#${lead.hashtag_source}`} size="small" sx={{ bgcolor: 'background.default', color: 'text.secondary', fontSize: 11 }} />
                  )}
                  {lead.service_type && (
                    <Chip
                      label={lead.service_type.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(122,76,255,0.15)',
                        color: '#a78bfa',
                        fontSize: 10,
                        height: 18,
                        textTransform: 'capitalize',
                      }}
                    />
                  )}
                  {lead.sample_delivery_id && (
                    <Chip
                      label="Sample ✓"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(74,222,128,0.15)',
                        color: 'success.main',
                        fontSize: 10,
                        height: 18,
                      }}
                    />
                  )}
                </Box>
              </TableCell>
              {/* Stop propagation on Status select so changing it doesn't open the DM dialog. */}
              <TableCell onClick={e => e.stopPropagation()}>
                <FormControl size="small" variant="standard">
                  <Select
                    value={lead.contact_status}
                    onChange={e => onStatusChange(lead, e.target.value as InstagramLead['contact_status'])}
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
              <TableCell align="right" onClick={e => e.stopPropagation()}>
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AutoFixHighIcon fontSize="small" />}
                    onClick={() => onDmClick(lead)}
                    sx={{
                      bgcolor: lead.dm_script ? '#5c5470' : '#7a4cff',
                      color: '#fff',
                      textTransform: 'none',
                      fontSize: 12,
                      px: 1.5,
                      '&:hover': { bgcolor: lead.dm_script ? '#7a7090' : '#6a3def' },
                    }}
                  >
                    {lead.dm_script ? 'View DM' : 'Generate DM'}
                  </Button>
                  {lead.profile_url && (
                    <Tooltip title="Open Instagram profile">
                      <IconButton size="small" component="a" href={lead.profile_url} target="_blank" rel="noopener" sx={{ color: 'text.secondary' }}>
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
  );
}

export function InstagramLeadsPage() {
  const [tab, setTab] = useState(0); // 0 = Auto-Discover, 1 = Manual Search, 2 = All Leads, 3 = Top Leads

  // Auto-discover state
  const [niche, setNiche] = useState('content creator');
  const [maxPostsPerHashtag, setMaxPostsPerHashtag] = useState(30);
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<{ hashtags: string[]; jobs: number; message: string } | null>(null);

  // Manual search state
  const [hashtag, setHashtag] = useState('');
  const [maxPosts, setMaxPosts] = useState(50);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  // Leads state
  const [leads, setLeads] = useState<InstagramLead[]>([]);
  const [topLeads, setTopLeads] = useState<InstagramLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHashtag, setFilterHashtag] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // DM dialog state
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
        limit: 200,
      });
      if (res.success) setLeads(res.leads);
    } catch {
      showSnack('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterHashtag, filterStatus]);

  const loadTopLeads = useCallback(async () => {
    try {
      const res = await instagramLeadsService.getTopLeads();
      if (res.success) setTopLeads(res.leads);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadLeads(); loadTopLeads(); }, [loadLeads, loadTopLeads]);

  // Auto-refresh leads every 60s (PB poller imports every 5 min)
  useEffect(() => {
    const t = setInterval(() => { loadLeads(); loadTopLeads(); }, 60_000);
    return () => clearInterval(t);
  }, [loadLeads, loadTopLeads]);

  const handleAutoDiscover = async () => {
    setDiscovering(true);
    setDiscoverResult(null);
    try {
      const res = await instagramLeadsService.autoDiscover({
        niche,
        max_posts_per_hashtag: maxPostsPerHashtag,
        hashtag_count: 4,
      });
      if (res.success) {
        setDiscoverResult({
          hashtags: res.hashtags ?? [],
          jobs:     res.jobs?.length ?? 0,
          message:  res.message ?? 'Searches launched!',
        });
        showSnack(`Auto-discover launched ${res.jobs?.length} searches for "${niche}"`, 'info');
      } else {
        showSnack(res.error ?? 'Auto-discover failed', 'error');
      }
    } catch (err: any) {
      showSnack(err?.response?.data?.error ?? 'Auto-discover failed', 'error');
    } finally {
      setDiscovering(false);
    }
  };

  const handleSearch = async () => {
    if (!hashtag.trim()) return;
    setSearching(true);
    setSearchMsg(null);
    try {
      const res = await instagramLeadsService.searchByHashtag(hashtag.trim(), maxPosts);
      if (res.success) {
        setSearchMsg(res.message ?? 'Search launched!');
        showSnack(`PhantomBuster launched for #${hashtag}`, 'info');
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
    const existing = lead.dm_script ?? '';
    setDmDialog({ open: true, lead, generating: false, text: existing });

    // Auto-generate on first open so the user never sees an empty dialog.
    // (User feedback: opening a lead with no DM yet was confusing — they
    // didn't know the next step was to click "Generate DM".)
    if (!existing) {
      // Defer one tick so the dialog is visible while generation runs.
      setTimeout(() => generateDm(lead), 50);
    }
  };

  const generateDm = async (overrideLead?: InstagramLead) => {
    const target = overrideLead ?? dmDialog.lead;
    if (!target) return;
    setDmDialog(d => ({ ...d, lead: target, open: true, generating: true }));
    try {
      const res = await instagramLeadsService.generateDm(target.id);
      if (res.success && res.dm_script) {
        setDmDialog(d => ({ ...d, generating: false, text: res.dm_script! }));
        setLeads(ls => ls.map(l => l.id === target.id ? { ...l, dm_script: res.dm_script! } : l));
        setTopLeads(ls => ls.map(l => l.id === target.id ? { ...l, dm_script: res.dm_script! } : l));
      } else {
        showSnack(res.error ?? 'Generation failed', 'error');
        setDmDialog(d => ({ ...d, generating: false }));
      }
    } catch {
      showSnack('DM generation failed', 'error');
      setDmDialog(d => ({ ...d, generating: false }));
    }
  };

  /// One-tap "send" flow: copy DM, mark contacted, open Instagram profile in new tab.
  const sendAndOpen = async () => {
    if (!dmDialog.lead || !dmDialog.text) return;
    try {
      await navigator.clipboard.writeText(dmDialog.text);
    } catch { /* clipboard may be blocked; continue */ }
    if (dmDialog.lead.contact_status === 'new') {
      await updateStatus(dmDialog.lead, 'contacted');
    }
    if (dmDialog.lead.profile_url) {
      window.open(dmDialog.lead.profile_url, '_blank', 'noopener');
    }
    showSnack('DM copied + marked contacted. Paste into IG.', 'success');
    setDmDialog(d => ({ ...d, open: false }));
  };

  const updateStatus = async (lead: InstagramLead, status: InstagramLead['contact_status']) => {
    try {
      await instagramLeadsService.updateContactStatus(lead.id, status);
      setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, contact_status: status } : l));
      setTopLeads(ls => ls.map(l => l.id === lead.id ? { ...l, contact_status: status } : l));
    } catch {
      showSnack('Failed to update status', 'error');
    }
  };

  /// User overrides the AI-picked service for the lead currently open in
  /// the DM dialog. Persists to the backend so subsequent /generate-dm
  /// and /generate-sample calls pitch the chosen service.
  const overrideServiceType = async (newType: InstagramLead['service_type'] | null | '') => {
    if (!dmDialog.lead) return;
    const target = dmDialog.lead;
    const normalized: InstagramLead['service_type'] = (newType === '' || !newType) ? null : newType;
    // Optimistically update UI first — feels snappier; if the server
    // rejects we still rollback in the catch.
    setDmDialog(d => d.lead ? ({ ...d, lead: { ...d.lead!, service_type: normalized } }) : d);
    setLeads(ls => ls.map(l => l.id === target.id ? { ...l, service_type: normalized } : l));
    setTopLeads(ls => ls.map(l => l.id === target.id ? { ...l, service_type: normalized } : l));
    try {
      await instagramLeadsService.updateServiceType(target.id, normalized);
      showSnack(`Service switched to ${normalized ?? 'AI default'} — click Regenerate for a new DM`, 'success');
    } catch {
      showSnack('Failed to update service type', 'error');
      setDmDialog(d => d.lead ? ({ ...d, lead: { ...d.lead!, service_type: target.service_type } }) : d);
      setLeads(ls => ls.map(l => l.id === target.id ? { ...l, service_type: target.service_type } : l));
    }
  };

  /// Generate a portfolio sample tailored to the lead's service_type, save
  /// the /delivery/:id link on the lead, then regenerate the DM so it
  /// references the link in copy. One click → DM with portfolio attached.
  const generateSample = async () => {
    if (!dmDialog.lead) return;
    const lead = dmDialog.lead;
    setDmDialog(d => ({ ...d, generating: true }));
    try {
      const res = await instagramLeadsService.generateSample(lead.id);
      if (!res.success) {
        if (res.requires_source_url) {
          const url = window.prompt(
            `This lead's pitch is CLIPPING — paste a YouTube/podcast/Twitch URL of one of @${lead.username}'s videos to clip:`,
          );
          if (!url) {
            setDmDialog(d => ({ ...d, generating: false }));
            return;
          }
          const res2 = await instagramLeadsService.generateSample(lead.id, url);
          if (!res2.success) {
            showSnack(res2.error ?? 'Sample generation failed', 'error');
            setDmDialog(d => ({ ...d, generating: false }));
            return;
          }
          await applySampleAndRegenerate(lead, res2.delivery_url!);
          return;
        }
        showSnack(res.error ?? 'Sample generation failed', 'error');
        setDmDialog(d => ({ ...d, generating: false }));
        return;
      }
      await applySampleAndRegenerate(lead, res.delivery_url!);
    } catch (err: any) {
      showSnack(err?.response?.data?.error ?? 'Sample generation failed', 'error');
      setDmDialog(d => ({ ...d, generating: false }));
    }
  };

  /// Append the sample link to the DM and persist the regenerated copy.
  const applySampleAndRegenerate = async (lead: InstagramLead, deliveryUrl: string) => {
    // Build full URL using current origin so it's pasteable into IG verbatim.
    const fullUrl = deliveryUrl.startsWith('http')
      ? deliveryUrl
      : `${window.location.protocol}//videosync.video${deliveryUrl}`;

    const existing = dmDialog.text || lead.dm_script || '';
    const withLink = existing
      ? `${existing}\n\nHere's the sample I made: ${fullUrl}`
      : `made a quick sample for you — ${fullUrl} — want me to send the breakdown?`;

    setDmDialog(d => ({
      ...d,
      generating: false,
      text: withLink,
      lead: { ...lead, sample_delivery_id: deliveryUrl.split('/').pop() ?? null },
    }));
    setLeads(ls => ls.map(l =>
      l.id === lead.id ? { ...l, sample_delivery_id: deliveryUrl.split('/').pop() ?? null } : l,
    ));
    showSnack('Sample queued — render takes 1-3 min. Link is already in the DM ✓', 'success');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.secondary' }}>
            Instagram Lead Finder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Agentic prospect discovery for clipping, SaaS demo packs, thumbnails, mockups, education videos, 3D scenes, voice/audio work, and mixed agency bundles. Auto-scores leads and generates cold DMs.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`${leads.length} leads`} size="small" sx={{ bgcolor: 'background.default', color: 'text.secondary' }} />
          <Chip label={`${topLeads.length} top-scored`} size="small" color="success" />
        </Box>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<AutoAwesomeIcon fontSize="small" />} iconPosition="start" label="Auto-Discover" sx={{ minHeight: 40 }} />
        <Tab icon={<TagIcon fontSize="small" />} iconPosition="start" label="Manual Search" sx={{ minHeight: 40 }} />
        <Tab icon={<PeopleIcon fontSize="small" />} iconPosition="start" label={`All Leads (${leads.length})`} sx={{ minHeight: 40 }} />
        <Tab icon={<StarIcon fontSize="small" />} iconPosition="start" label={`Top Leads (${topLeads.length})`} sx={{ minHeight: 40 }} />
        <Tab icon={<span style={{ fontSize: 14 }}>📘</span>} iconPosition="start" label="How It Works" sx={{ minHeight: 40 }} />
      </Tabs>

      {/* ── Auto-Discover tab ─────────────────────────────────────────────── */}
      {tab === 0 && (
        <Box>
          <Card sx={{ mb: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon fontSize="small" sx={{ color: 'primary.main' }} />
                AI-Powered Auto-Discovery
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The AI picks the best hashtags for your target niche, launches searches, imports leads in the background, scores each prospect against the full service menu, and suggests the best offer to pitch.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                  <InputLabel>Target Niche</InputLabel>
                  <Select
                    value={niche}
                    label="Target Niche"
                    onChange={e => setNiche(e.target.value)}
                  >
                    {NICHE_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Profiles per hashtag"
                  type="number"
                  value={maxPostsPerHashtag}
                  onChange={e => setMaxPostsPerHashtag(Number(e.target.value))}
                  size="small"
                  sx={{ width: 160 }}
                  inputProps={{ min: 10, max: 100, step: 10 }}
                />
                <Button
                  variant="contained"
                  startIcon={discovering ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                  onClick={handleAutoDiscover}
                  disabled={discovering}
                  sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
                >
                  {discovering ? 'Launching…' : 'Auto-Discover Leads'}
                </Button>
              </Box>

              {discovering && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">AI selecting hashtags and launching searches…</Typography>
                  <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
                </Box>
              )}

              {discoverResult && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ color: 'success.main', mb: 1 }}>
                    ✅ {discoverResult.jobs} searches launched
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {discoverResult.hashtags.map(h => (
                      <Chip key={h} label={`#${h}`} size="small" sx={{ bgcolor: 'background.paper', color: 'primary.main', fontSize: 11 }} />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">{discoverResult.message}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5 }}>How it works</Typography>
              {[
                ['1. Pick a niche', 'Choose which type of creator you\'re targeting (YouTubers, podcasters, coaches, etc.)'],
                ['2. AI selects hashtags', 'The AI picks 4 high-signal hashtags where your ideal clients actively post'],
                ['3. PhantomBuster scrapes', 'PB finds creators posting under those hashtags — runs in background (5–10 min)'],
                ['4. Auto-import + scoring', 'Results auto-import every 5 min. AI scores each lead 0–100 for client likelihood'],
                ['5. Generate & send DMs', 'Go to "Top Leads" tab → click the wand icon → copy personalised cold DM'],
              ].map(([title, desc]) => (
                <Box key={title} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                  <Chip label={title} size="small" sx={{ bgcolor: 'background.paper', color: 'text.secondary', fontSize: 11, flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ pt: 0.3 }}>{desc}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── Manual Search tab ─────────────────────────────────────────────── */}
      {tab === 1 && (
        <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.secondary' }}>
              Manual Hashtag Search
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
                      <TagIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
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
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                {searchMsg}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
              Results appear in "All Leads" within ~5–10 minutes and are scored automatically.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ── All Leads tab ─────────────────────────────────────────────────── */}
      {tab === 2 && (
        <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            {/* Inline how-to banner — answers "I don't know what to do next" */}
            <Box sx={{
              mb: 2, p: 2, borderRadius: 1,
              bgcolor: 'rgba(122,76,255,0.08)',
              border: '1px solid rgba(122,76,255,0.3)',
            }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary', mb: 0.5 }}>
                Next step: turn these leads into paying clients
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}>
                1. Click any row → DM is generated automatically (tailored to the lead's <b>service tag</b>: clipping / animation / thumbnail / UGC).<br />
                2. Click <b>"+ Attach sample"</b> (yellow) → AI generates a portfolio piece for that exact lead, link auto-pasted into the DM.<br />
                3. Click <b>"Copy DM &amp; Open Instagram"</b> → script copied, status → <i>contacted</i>, IG opens in a new tab.<br />
                4. Paste the DM in Instagram. When they reply → <i>replied</i>; when they pay → <i>converted</i>.<br />
                Sample render takes 1-3 min — the link is shareable immediately and shows a "rendering" state until ready.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.secondary', flexGrow: 1 }}>
                All Leads
              </Typography>
              <TextField label="Filter hashtag" size="small" value={filterHashtag} onChange={e => setFilterHashtag(e.target.value)} sx={{ width: 160 }} />
              <FormControl size="small" sx={{ width: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
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
            ) : (
              <LeadsTable leads={leads} onDmClick={openDmDialog} onStatusChange={updateStatus} />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Top Leads tab ─────────────────────────────────────────────────── */}
      {tab === 3 && (
        <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.secondary', flexGrow: 1 }}>
                Top Leads — AI Score ≥ 60
              </Typography>
              <Button size="small" onClick={loadTopLeads}>Refresh</Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These creators scored highest as potential paying clients. The AI picks the best service to pitch per lead — see the service chip on each row. Click a row to review, override the service if you disagree, generate a DM, attach a sample, and copy it into Instagram.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <LeadsTable leads={topLeads} onDmClick={openDmDialog} onStatusChange={updateStatus} />
          </CardContent>
        </Card>
      )}

      {/* ── How It Works tab ─────────────────────────────────────────────── */}
      {tab === 4 && (
        <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'text.secondary', mb: 2 }}>
              📘 How Instagram Leads Work
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
              This dashboard finds Instagram creators who match your offer and generates personalized cold DMs + portfolio samples so you can close them. Below is the full workflow and the list of services you can pitch.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary', mb: 1 }}>
              🔁 The workflow
            </Typography>
            <Box component="ol" sx={{ pl: 2.5, color: 'text.secondary', '& li': { mb: 1 } }}>
              <li><strong>Auto-Discover</strong> (recommended): pick your niche (podcaster, SaaS founder, etc.) → AI picks the 3–4 best hashtags → launches PhantomBuster searches in background.</li>
              <li><strong>Manual Search</strong>: enter a specific hashtag if you already know what works (e.g. <code>#shopifystore</code>).</li>
              <li>Wait 3–10 min. PhantomBuster scrapes Instagram, imports leads here, AI scores each 0–100 against our service offerings and picks the best-fit service type.</li>
              <li>Open <strong>All Leads</strong> or <strong>Top Leads</strong>. Click any row → DM dialog opens.</li>
              <li>Review the AI's service pick — override it via the dropdown if you disagree.</li>
              <li>Click <strong>+ Attach sample</strong> → system generates a portfolio piece tailored to the chosen service (a thumbnail, an animation, a product mockup, etc.) and creates a shareable <code>/delivery/:id</code> link.</li>
              <li>Click <strong>Generate DM</strong> (or Regenerate) → AI writes a personalized cold message that references their bio and naturally includes the delivery link.</li>
              <li>Click <strong>Copy DM &amp; Open Instagram</strong> → DM copied to clipboard, Instagram opens in a new tab, lead auto-marks as "contacted". Paste + send.</li>
              <li>When they reply → change status to <em>replied</em>. When they pay → <em>converted</em>. The admin revenue ledger tracks your cut automatically.</li>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary', mb: 1 }}>
              💼 What you can pitch — service menu
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>
              The AI picks one per lead based on their bio, but you can override before generating the DM. Pricing shown is what we suggest — adjust per-deal.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {SERVICE_TYPE_OPTIONS.map(s => (
                <Box key={s.value} sx={{
                  p: 2, borderRadius: 1.5,
                  bgcolor: 'rgba(42,36,56,0.5)',
                  border: '1px solid rgba(92,84,112,0.3)',
                }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary', mb: 0.5 }}>
                    {s.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {s.pitch}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary', mb: 1 }}>
              💰 How you get paid
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, color: 'text.secondary', '& li': { mb: 1 } }}>
              <li>Your cut is <strong>50%</strong> of everything paid on your leads (admin sends USDC to your Base wallet; we'll share payout dates + address collection details separately).</li>
              <li>For retainer deals closed via DM, invoice the client directly and coordinate with the admin off-ledger.</li>
              <li>Leads are private to you — no other team member sees your pipeline. Attribution survives even if the admin re-scores or re-attaches samples.</li>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.secondary', mb: 1 }}>
              ⚡ Tips
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, color: 'text.secondary', '& li': { mb: 1 } }}>
              <li>Top Leads (score ≥ 60) convert ~3× better than average — prioritize those.</li>
              <li>Regenerate a DM if the first one feels off — AI takes context from the lead's full bio each time.</li>
              <li>For <strong>Landing Page</strong> leads: paste the prospect's own site URL when attaching the sample — system scrapes their hero image for a more relevant mockup.</li>
              <li>For <strong>Clipping / Kick Auto-Clipper</strong> leads: system asks for a source video URL — paste it, the sample clip is built from that.</li>
              <li>When follower count is unknown (pulled from hashtag posts, not profile scrape), the AI still scores based on bio + handle — these are still viable leads.</li>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── DM Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={dmDialog.open} onClose={() => setDmDialog(d => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'background.paper', color: 'text.secondary' }}>
          Cold DM — @{dmDialog.lead?.username}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper', pt: '12px !important' }}>
          {/* Service-type override — the AI picks one when scoring the lead,
              but the user can flip it here before generating the DM. Updates
              the lead on the server so subsequent samples + DMs use the
              override. See SERVICE_TYPE_OPTIONS for the full menu + pricing. */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Service to pitch (AI's pick — change if you have a better read)
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={dmDialog.lead?.service_type ?? ''}
                onChange={(e) => overrideServiceType(e.target.value as InstagramLead['service_type'])}
                displayEmpty
                sx={{ fontSize: 13, bgcolor: 'background.default', color: 'text.secondary' }}
              >
                <MenuItem value=""><em>— AI default —</em></MenuItem>
                {SERVICE_TYPE_OPTIONS.map(s => (
                  <MenuItem key={s.value} value={s.value}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                      <Typography variant="caption" color="text.disabled">{s.pitch}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {dmDialog.text ? (
            <Box
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                fontSize: 14, color: 'text.secondary', bgcolor: 'background.default', p: 2,
                borderRadius: 1, border: '1px solid', borderColor: 'divider', m: 0,
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
        <DialogActions sx={{ bgcolor: 'background.paper', gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setDmDialog(d => ({ ...d, open: false }))} color="inherit">Close</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={dmDialog.generating ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon />}
            onClick={() => generateDm()}
            disabled={dmDialog.generating}
            variant="outlined"
            sx={{ borderColor: 'divider', color: 'text.secondary' }}
          >
            {dmDialog.generating ? 'Generating outreach draft' : (dmDialog.text ? 'Regenerate' : 'Generate DM')}
          </Button>
          {!dmDialog.lead?.sample_delivery_id && (
            <Button
              startIcon={dmDialog.generating ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={generateSample}
              disabled={dmDialog.generating}
              variant="outlined"
              sx={{
                borderColor: '#facc15', color: '#facc15',
                '&:hover': { borderColor: '#fde047', bgcolor: 'rgba(250,204,21,0.08)' },
              }}
              title="Auto-generate a sample (thumbnail/animation/clip) tailored to this lead's service tag, then add the public link to the DM."
            >
              + Attach sample
            </Button>
          )}
          {dmDialog.text && (
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={() => { navigator.clipboard.writeText(dmDialog.text); showSnack('DM copied!'); }}
              variant="outlined"
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            >
              Copy only
            </Button>
          )}
          {dmDialog.text && dmDialog.lead?.profile_url && (
            <Button
              startIcon={<OpenInNewIcon />}
              onClick={sendAndOpen}
              variant="contained"
              sx={{
                bgcolor: '#7a4cff', color: '#fff',
                '&:hover': { bgcolor: '#6a3def' },
                fontWeight: 700,
              }}
            >
              Copy DM &amp; Open Instagram
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
