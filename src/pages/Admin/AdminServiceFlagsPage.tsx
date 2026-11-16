import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Button, Snackbar, Alert,
} from '@mui/material';
import { serviceFlagsService, type ServiceFlag } from '@/services/serviceFlags.service';
import { educationAdminService } from '@/services/education.service';

const GROUP_LABELS: Record<string, string> = {
  clipping: 'Clipping (Twitch/YouTube → Zernio)',
  kick_auto_clipper: 'Kick Auto-Clipper (Kick VODs → Zernio)',
  campaigns: '📅 Campaigns (monthly subscriptions app-wide — coming-soon + outreach copy)',
  prospecting: 'Prospect discovery + scoring',
  outreach: 'DM/email generation',
  sample_packs: 'Sample pack renders',
  admin_tests: 'Admin test renders',
  youtube_education_posting: 'YouTube Education Posting (AI-generated educational videos posted to connected channels — replaced legacy clipping Nov 13 2026; currently OFF)',
  chat_agents: 'Chat agents (WS + campaign chats + TG bot)',
};

export function AdminServiceFlagsPage() {
  const [flags, setFlags] = useState<ServiceFlag[]>([]);
  const [scheduleValue, setScheduleValue] = useState('0.5');
  const [scheduleLabel, setScheduleLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const load = async () => {
    setLoading(true);
    try {
      setFlags(await serviceFlagsService.listFlags());
      try {
        const sched = await educationAdminService.getSchedule();
        setScheduleValue(String(sched.per_channel_per_day));
        setScheduleLabel(sched.cadence_label ?? '');
      } catch { /* schedule endpoint optional */ }
    } catch (err: any) {
      setSnack({ open: true, message: err?.message ?? 'Failed to load flags', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flip = async (service: string, enabled: boolean) => {
    if (!window.confirm(`Turn ${service} ${enabled ? 'ON' : 'OFF'}?`)) return;
    try {
      const updated = await serviceFlagsService.setFlag(service, enabled);
      setFlags(fs => fs.map(f => (f.service === updated.service ? updated : f)));
      setSnack({ open: true, message: `${service} → ${enabled ? 'ON' : 'OFF'}`, severity: 'success' });
    } catch (err: any) {
      setSnack({ open: true, message: err?.message ?? 'Failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        AI Service Switches
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Takes effect immediately — no restart. In-flight runs always finish. QA review and
        embeddings follow each service automatically.
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            🎓 Education Posting Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Videos generated + posted per connected channel per day. Current YouTube API quota
            allows only a handful of uploads per day until a quota increase is approved — keep
            this low (0.5 = 1 video every 2 days per channel).
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Videos / channel / day"
              size="small"
              type="number"
              inputProps={{ step: 0.1, min: 0.1, max: 4 }}
              value={scheduleValue}
              onChange={e => setScheduleValue(e.target.value)}
              sx={{ width: 220 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                try {
                  const updated = await educationAdminService.setSchedule(parseFloat(scheduleValue));
                  setSnack({
                    open: true,
                    message: `Education schedule → ${updated.per_channel_per_day}/channel/day`,
                    severity: 'success',
                  });
                } catch (err: any) {
                  setSnack({ open: true, message: err?.message ?? 'Failed', severity: 'error' });
                }
              }}
            >
              Save Schedule
            </Button>
            <Typography variant="body2" color="text.secondary">
              {scheduleLabel}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>
              ) : flags.map(f => (
                <TableRow key={f.service}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{f.service}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {GROUP_LABELS[f.service] ?? 'Managed campaign service'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={f.enabled ? 'ON' : 'OFF'}
                      size="small"
                      color={f.enabled ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {f.updated_by ?? 'seed'}{f.updated_at ? ` · ${f.updated_at}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color={f.enabled ? 'warning' : 'success'}
                      onClick={() => flip(f.service, !f.enabled)}
                    >
                      Turn {f.enabled ? 'OFF' : 'ON'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
