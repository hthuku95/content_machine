import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, GridLegacy as Grid, Chip, Alert, CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Forum as ForumIcon,
  AttachFile as FileIcon,
  VideoLibrary as DeliveriesIcon,
  Campaign as CampaignsIcon,
  Groups as ProspectsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import { PATHS } from '@/routes/paths';
import { useAuthStore } from '@/stores/authStore';
import { ADMIN_SERVICE_CHIPS, type AdminServiceChip } from '@/constants/adminServices';

function StatCard({
  icon, label, value, accent,
}: { icon: React.ReactNode; label: string; value: number; accent?: string }) {
  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: accent ?? 'rgba(122,76,255,0.12)', color: accent ? '#fff' : 'primary.main',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.secondary' }}>{value}</Typography>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({
  title, desc, icon, to, count,
}: { title: string; desc: string; icon: React.ReactNode; to: string; count?: string }) {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate(to)}
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
          {count && <Chip label={count} size="small" color="success" />}
        </Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.secondary' }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{desc}</Typography>
      </CardContent>
    </Card>
  );
}

export function AdminOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<{ total_users: number; active_users: number; total_chat_sessions: number; total_files: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [prospectCount, setProspectCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, deliveries, campaigns, prospects] = await Promise.all([
          adminService.getStats(),
          adminService.listDeliveries().catch(() => []),
          adminService.listCampaigns().catch(() => []),
          adminService.listProspects().catch(() => []),
        ]);
        if (cancelled) return;
        setStats(s);
        setDeliveryCount((deliveries as { status?: string }[]).filter((d) => d.status === 'completed').length);
        setCampaignCount((campaigns as { status?: string }[]).filter((c) => c.status === 'active').length);
        setProspectCount(prospects.length);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: 'text.secondary' }}>
          Admin Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {user?.email} — staff/superuser console for the Website-URL→Video business.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleIcon />} label="Total users" value={stats?.total_users ?? 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PersonAddIcon />} label="Active users" value={stats?.active_users ?? 0} accent="rgba(74,222,128,0.15)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<ForumIcon />} label="Chat sessions" value={stats?.total_chat_sessions ?? 0} accent="rgba(59,130,246,0.15)" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<FileIcon />} label="Uploaded files" value={stats?.total_files ?? 0} />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ color: 'text.secondary', mb: 2 }}>
        Quick Links
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickLinkCard
            title="Deliveries"
            desc="List all deliveries & sample packs, view R2 output, create landing-page renders."
            icon={<DeliveriesIcon />}
            to={PATHS.ADMIN.DELIVERIES}
            count={String(deliveryCount)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickLinkCard
            title="Prospects"
            desc="Search scored prospects, generate DM/outreach + free sample packs, send emails."
            icon={<ProspectsIcon />}
            to={PATHS.ADMIN.PROSPECTS}
            count={String(prospectCount)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickLinkCard
            title="Campaigns"
            desc="Manage active/paused campaign state for all 12 Managed Campaign services."
            icon={<CampaignsIcon />}
            to={PATHS.ADMIN.CAMPAIGNS}
            count={String(campaignCount)}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ color: 'text.secondary', mb: 2 }}>
        Managed Campaign Services
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {ADMIN_SERVICE_CHIPS.map((s: AdminServiceChip) => (
          <Chip
            key={s.value}
            label={`${s.label} · $${s.price}`}
            size="small"
            sx={{
              bgcolor: 'rgba(122,76,255,0.1)',
              color: '#a78bfa',
              border: '1px solid rgba(122,76,255,0.25)',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}