import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip,
} from '@mui/material';
import { Add as AddIcon, PlayArrow, Pause, Cancel, Refresh } from '@mui/icons-material';
import { campaignService, type Campaign } from '@/services/campaign.service';
import { PATHS } from '@/routes/paths';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  active: 'success',
  paused: 'warning',
  cancelled: 'error',
  completed: 'info',
  pending_payment: 'default',
};

const SERVICE_LABELS: Record<string, string> = {
  clipping: 'Clipping',
  kick_auto_clipper: 'Kick Auto-Clipper',
  landing_page: 'Landing Page',
  education: 'Education',
  manim_explainer: 'Manim Explainer',
  whiteboard_animation: 'Whiteboard',
  kinetic_typography: 'Kinetic Text',
  animated_infographic: 'Infographic',
  algorithm_viz: 'Algorithm Viz',
  investor_pitch: 'Investor Pitch',
  year_in_review: 'Year in Review',
  isometric_explainer: 'Isometric',
};

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const list = await campaignService.list();
      setCampaigns(list);
    } catch (e) {
      console.error('Failed to load campaigns', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id: string, action: 'pause' | 'resume' | 'cancel') {
    try {
      if (action === 'pause') await campaignService.pause(id);
      else if (action === 'resume') await campaignService.resume(id);
      else await campaignService.cancel(id);
      await load();
    } catch (e) {
      console.error(`Failed to ${action} campaign`, e);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Social Media Campaigns</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={load}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(PATHS.CAMPAIGNS.NEW)}>
            New Campaign
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Typography color="text.secondary">Loading campaigns...</Typography>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No campaigns yet</Typography>
            <Typography color="text.disabled" sx={{ mb: 2 }}>
              Create your first social media campaign to start generating daily content.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(PATHS.CAMPAIGNS.NEW)}>
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Posts</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map(c => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(PATHS.CAMPAIGNS.DETAIL(c.id))}
                >
                  <TableCell><Typography fontWeight={600}>{c.name}</Typography></TableCell>
                  <TableCell>{SERVICE_LABELS[c.service_type] || c.service_type}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.status.replace('_', ' ')}
                      color={statusColor[c.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{c.total_posts_published}/{c.total_posts_planned}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {Array.isArray(c.schedule) ? c.schedule.map((s: { time: string; platform: string }) => `${s.time} ${s.platform}`).join(', ') : '-'}
                  </TableCell>
                  <TableCell align="right" onClick={e => e.stopPropagation()}>
                    {c.status === 'active' && (
                      <Tooltip title="Pause"><IconButton size="small" onClick={() => handleAction(c.id, 'pause')}><Pause fontSize="small" /></IconButton></Tooltip>
                    )}
                    {c.status === 'paused' && (
                      <Tooltip title="Resume"><IconButton size="small" onClick={() => handleAction(c.id, 'resume')}><PlayArrow fontSize="small" /></IconButton></Tooltip>
                    )}
                    {c.status !== 'cancelled' && (
                      <Tooltip title="Cancel"><IconButton size="small" onClick={() => handleAction(c.id, 'cancel')}><Cancel fontSize="small" /></IconButton></Tooltip>
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
