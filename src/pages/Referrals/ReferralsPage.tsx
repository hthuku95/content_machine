import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  CircularProgress, Snackbar, Alert, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { referralService, type ReferralCommission } from '@/services/referral.service';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function statusChip(status: string) {
  const color = status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'default';
  return <Chip label={status} color={color} size="small" />;
}

export function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [appCodes, setAppCodes] = useState<Array<{ app: string; app_name: string; code: string; ref_url: string; landing_url: string }>>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [codesRes, commRes] = await Promise.all([
        referralService.getMyAppCodes(),
        referralService.getMyCommissions(),
      ]);
      if (codesRes.success) {
        setAppCodes(codesRes.codes || []);
      }
      if (commRes.success) {
        setCommissions(commRes.commissions);
        setTotalEarned(commRes.total_earned_cents);
      }
    } catch {
      setSnackbar({ message: 'Failed to load referral data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (text: string, label = 'Copied!') => {
    navigator.clipboard.writeText(text);
    setSnackbar({ message: label, severity: 'success' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        <MonetizationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Referrals
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Share your referral link to earn 40% commission on the first month of any deal you refer.
      </Typography>

      {/* App Links Card — one per campaign app */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Your Referral Links
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            One link per app — share the right one. You earn 40% of each referred
            customer's first month.
          </Typography>
          {appCodes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No links yet — reload in a moment.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {appCodes.map((c) => (
                <Box key={c.app}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {c.app_name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      mt: 0.5,
                    }}
                  >
                    <LinkIcon color="primary" />
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}
                    >
                      {c.landing_url}
                    </Typography>
                    <Tooltip title="Copy link">
                      <IconButton size="small" onClick={() => copyToClipboard(c.landing_url, `${c.app_name} link copied!`)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Code: <strong>{c.code}</strong>
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Commission History
            </Typography>
            <Chip
              label={`Total earned: ${formatCents(totalEarned)}`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {commissions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MonetizationOnIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">No commissions yet.</Typography>
              <Typography variant="caption" color="text.disabled">
                Share your referral link to start earning.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ '& td, & th': { px: 1.5, py: 1 } }}>
              <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Prospect</TableCell>
                  <TableCell align="right">Deal Amount</TableCell>
                  <TableCell align="right">Commission</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {c.prospect_id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatCents(c.deal_amount_cents)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="success.main">
                        {formatCents(c.commission_cents)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{statusChip(c.status)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="caption">
                        {new Date(c.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* How It Works */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        How It Works
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {[
          { step: '1', title: 'Share your link', desc: 'Send your referral link to content creators, businesses, and streamers who need video content.' },
          { step: '2', title: 'They sign up', desc: 'When someone clicks your link and signs up, they\'re tagged as your referral.' },
          { step: '3', title: 'They purchase', desc: 'When a referred prospect purchases any of our 12 Managed Campaigns, you earn commission.' },
          { step: '4', title: 'Get paid', desc: '40% of the first month\'s payment is credited to your account as commission.' },
        ].map((item) => (
          <Box key={item.step} sx={{ display: 'flex', gap: 2 }}>
            <Chip label={item.step} color="primary" size="small" sx={{ minWidth: 28, fontWeight: 700 }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>{snackbar.message}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
