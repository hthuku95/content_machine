import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Button, Snackbar, Alert,
} from '@mui/material';
import { serviceFlagsService, type ServiceFlag } from '@/services/serviceFlags.service';

const GROUP_LABELS: Record<string, string> = {
  clipping: 'Clipping (Twitch/YouTube → Zernio)',
  kick_auto_clipper: 'Kick Auto-Clipper (Kick VODs → Zernio)',
  prospecting: 'Prospect discovery + scoring',
  outreach: 'DM/email generation',
  sample_packs: 'Sample pack renders',
  admin_tests: 'Admin test renders',
  legacy_youtube_clipping: 'Legacy YouTube auto/manual clipping',
  chat_agents: 'Chat agents (WS + campaign chats + TG bot)',
};

export function AdminServiceFlagsPage() {
  const [flags, setFlags] = useState<ServiceFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const load = async () => {
    setLoading(true);
    try {
      setFlags(await serviceFlagsService.listFlags());
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
