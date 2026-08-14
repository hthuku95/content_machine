import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Card, CardContent, MenuItem,
  Grid, Chip, Alert, Snackbar, IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack } from '@mui/icons-material';
import { campaignService, type CreateCampaignRequest } from '@/services/campaign.service';
import { socialService, type SocialAccount } from '@/services/social.service';
import { PATHS } from '@/routes/paths';

const SERVICE_OPTIONS = [
  { value: 'clipping', label: '🎬 Clipping', desc: '$297/mo — daily clips from long-form content' },
  { value: 'kick_auto_clipper', label: '⚡ Kick Auto-Clipper', desc: '$297/mo — daily clips from Kick streamers' },
  { value: 'education', label: '📚 Education', desc: '$199/mo — daily Manim explainer videos' },
  { value: 'landing_page', label: '🚀 Landing Page Hero', desc: '$149/mo — daily animated hero videos' },
  { value: 'manim_explainer', label: '🎞️ Manim Explainer', desc: '$149/mo — daily animated explainers' },
  { value: 'whiteboard_animation', label: '✏️ Whiteboard Animation', desc: '$149/mo — daily whiteboard explainers' },
  { value: 'kinetic_typography', label: '🔤 Kinetic Typography', desc: '$149/mo — daily text-motion videos' },
  { value: 'animated_infographic', label: '📊 Animated Infographic', desc: '$149/mo — daily data viz videos' },
  { value: 'algorithm_viz', label: '💻 Algorithm Viz', desc: '$149/mo — daily algorithm videos' },
  { value: 'investor_pitch', label: '📈 Investor Pitch', desc: '$149/mo — daily pitch deck videos' },
  { value: 'year_in_review', label: '📅 Year in Review', desc: '$149/mo — daily recap videos' },
  { value: 'isometric_explainer', label: '🏗️ Isometric Explainer', desc: '$149/mo — daily isometric 3D videos' },
];

interface Slot {
  time: string;
  platform: string;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function futureStr(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [brief, setBrief] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(futureStr(30));
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [slots, setSlots] = useState<Slot[]>([
    { time: '08:00', platform: 'youtube' },
    { time: '12:00', platform: 'youtube' },
    { time: '17:00', platform: 'tiktok' },
  ]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [zernioProfileId, setZernioProfileId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      const profiles = await socialService.listMyProfiles();
      if (profiles.length > 0) {
        setProfiles(profiles);
        setZernioProfileId(profiles[0].id);
        await socialService.syncMyAccounts();
        const accs = await socialService.listAccounts();
        setAccounts(accs);
        setSelectedAccounts(accs
          .filter(a => a.profile_id === profiles[0].id)
          .map(a => a.id));
      }
    })();
  }, []);

  function onProfileChange(profileId: string) {
    setZernioProfileId(profileId);
    setSelectedAccounts(accounts
      .filter(a => a.profile_id === profileId)
      .map(a => a.id));
  }

  function addSlot() {
    setSlots([...slots, { time: '12:00', platform: 'youtube' }]);
  }

  function updateSlot(i: number, field: keyof Slot, value: string) {
    const next = [...slots];
    next[i] = { ...next[i], [field]: value };
    setSlots(next);
  }

  function removeSlot(i: number) {
    setSlots(slots.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!name || !serviceType || !brief) {
      setError('Name, service type, and brief are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const platforms = accounts
        .filter(a => selectedAccounts.includes(a.id))
        .map(a => ({ platform: a.platform, account_id: a.id }));

      const req: CreateCampaignRequest = {
        name,
        service_type: serviceType,
        brief,
        schedule: slots,
        platforms: platforms.length > 0 ? platforms : [{ platform: 'youtube', account_id: '' }],
        posts_per_day: postsPerDay,
        start_date: `${startDate}T00:00:00Z`,
        end_date: `${endDate}T00:00:00Z`,
        source_url: sourceUrl || null,
        zernio_profile_id: zernioProfileId,
      };

      const result = await campaignService.create(req);
      if (result.success) {
        setSuccess(`Campaign created! Status: ${result.status}`);
        setTimeout(() => navigate(PATHS.CAMPAIGNS.ROOT), 1500);
      } else {
        setError(result.error || 'Failed to create campaign');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  }

  const needsSourceUrl = serviceType === 'clipping' || serviceType === 'kick_auto_clipper';

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(PATHS.CAMPAIGNS.ROOT)} sx={{ mb: 2 }}>
        Back to Campaigns
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>New Campaign</Typography>

      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Service Type */}
          <TextField select label="Service Type" value={serviceType} onChange={e => setServiceType(e.target.value)} required fullWidth>
            {SERVICE_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{o.label}</Typography>
                  <Typography variant="caption" color="text.disabled">{o.desc}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Name */}
          <TextField label="Campaign Name" value={name} onChange={e => setName(e.target.value)} required fullWidth placeholder="e.g. Daily clips for my channel" />

          {/* Brief */}
          <TextField label="Content Brief" value={brief} onChange={e => setBrief(e.target.value)} required fullWidth multiline minRows={3}
            placeholder="Describe the topic, style, and any specific directions for the AI to follow when generating daily variations..." />

          {/* Source URL (for clipping services) */}
          {needsSourceUrl && (
            <TextField label="Source Video URL (YouTube/Kick/Twitch)" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} fullWidth
              placeholder="https://youtube.com/channel/... or https://kick.com/..." />
          )}

          {/* Schedule Slots */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Daily Post Schedule</Typography>
            {slots.map((slot, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField type="time" value={slot.time} onChange={e => updateSlot(i, 'time', e.target.value)}
                  size="small" sx={{ width: 140 }} />
                <TextField select value={slot.platform} onChange={e => updateSlot(i, 'platform', e.target.value)}
                  size="small" sx={{ width: 160 }}>
                  {['youtube', 'tiktok', 'instagram', 'twitter', 'linkedin', 'facebook'].map(p => (
                    <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
                  ))}
                </TextField>
                <IconButton size="small" onClick={() => removeSlot(i)} color="error"><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addSlot}>Add Slot</Button>
          </Box>

          {/* Posts Per Day */}
          <TextField label="Posts Per Day" type="number" value={postsPerDay} onChange={e => setPostsPerDay(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 10 }} sx={{ width: 200 }} />

          {/* Date Range */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} fullWidth
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} fullWidth
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          {/* Connected Social Accounts */}
          {profiles.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Zernio Profile</Typography>
              <TextField select value={zernioProfileId || ''} onChange={e => onProfileChange(e.target.value)} fullWidth size="small">
                {profiles.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name || p.id}</MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {accounts.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Post to Accounts</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {accounts.filter(a => a.profile_id === zernioProfileId).map(a => (
                  <Chip
                    key={a.id}
                    label={`${a.platform}: ${a.account_name}`}
                    color={selectedAccounts.includes(a.id) ? 'primary' : 'default'}
                    onClick={() => setSelectedAccounts(prev =>
                      prev.includes(a.id) ? prev.filter(id => id !== a.id) : [...prev, a.id]
                    )}
                    variant={selectedAccounts.includes(a.id) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* No Zernio profile warning */}
          {!zernioProfileId && (
            <Alert severity="info">
              No social accounts connected yet.{' '}
              <Button size="small" onClick={() => navigate(PATHS.SOCIAL_ACCOUNTS)}>Connect Accounts</Button>
            </Alert>
          )}

          {/* Submit */}
          <Button variant="contained" size="large" onClick={handleSubmit} disabled={submitting} sx={{ mt: 1 }}>
            {submitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
