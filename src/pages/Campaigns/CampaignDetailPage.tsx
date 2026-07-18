import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Alert, LinearProgress,
} from '@mui/material';
import {
  ArrowBack, PlayArrow, Pause, Cancel, Refresh, OpenInNew,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { campaignService, type Campaign, type CampaignPost } from '@/services/campaign.service';
import { PATHS } from '@/routes/paths';

const postStatusColor: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  pending_generation: 'warning',
  rendering: 'info',
  scheduled: 'info',
  published: 'success',
  failed: 'error',
};

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const result = await campaignService.get(id);
      setCampaign(result.campaign);
      setPosts(result.posts);
    } catch (e) {
      console.error('Failed to load campaign', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPosts() {
    if (!id) return;
    try {
      const p = await campaignService.getPosts(id);
      setPosts(p);
    } catch (e) {
      console.error('Failed to fetch posts', e);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleAction(action: 'pause' | 'resume' | 'cancel') {
    if (!id) return;
    try {
      await campaignService[action](id);
      await load();
    } catch (e) {
      console.error(`Failed to ${action} campaign`, e);
    }
  }

  if (loading || !campaign) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">{loading ? 'Loading...' : 'Campaign not found'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(PATHS.CAMPAIGNS.ROOT)} sx={{ mb: 2 }}>
        Back to Campaigns
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{campaign.name}</Typography>
          <Typography color="text.secondary">
            {campaign.service_type} &middot; {new Date(campaign.start_date).toLocaleDateString()} &ndash; {new Date(campaign.end_date).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh"><IconButton onClick={load}><Refresh /></IconButton></Tooltip>
          {campaign.status === 'active' && (
            <Button variant="outlined" startIcon={<Pause />} onClick={() => handleAction('pause')} color="warning">Pause</Button>
          )}
          {campaign.status === 'paused' && (
            <Button variant="outlined" startIcon={<PlayArrow />} onClick={() => handleAction('resume')} color="success">Resume</Button>
          )}
          {campaign.status !== 'cancelled' && (
            <Button variant="outlined" startIcon={<Cancel />} onClick={() => handleAction('cancel')} color="error">Cancel</Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined"><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700}>{campaign.total_posts_planned || 0}</Typography>
            <Typography variant="caption" color="text.secondary">Planned</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined"><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} color="success.main">{campaign.total_posts_published || 0}</Typography>
            <Typography variant="caption" color="text.secondary">Published</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined"><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} color="info.main">{posts.filter(p => p.status === 'scheduled').length}</Typography>
            <Typography variant="caption" color="text.secondary">Scheduled</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined"><CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} color="error.main">{posts.filter(p => p.status === 'failed').length}</Typography>
            <Typography variant="caption" color="text.secondary">Failed</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {campaign.source_url && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<ScheduleIcon />}>
          Source URL: {campaign.source_url}
        </Alert>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>Post Schedule</Typography>

      {posts.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No posts generated yet. Posts will be created automatically by the campaign worker.</Typography>
        </CardContent></Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Caption</TableCell>
                <TableCell align="right">Media</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map(p => (
                <TableRow key={p.id}>
                  <TableCell>#{p.day_number}</TableCell>
                  <TableCell>{new Date(p.scheduled_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={p.status.replace('_', ' ')} color={postStatusColor[p.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.caption || '-'}
                  </TableCell>
                  <TableCell align="right">
                    {p.media_r2_url && (
                      <Tooltip title="Open media">
                        <IconButton size="small" href={p.media_r2_url} target="_blank"><OpenInNew fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
