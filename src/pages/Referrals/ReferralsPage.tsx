import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  CircularProgress, Snackbar, Alert, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  IconButton, Tooltip, Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { referralService, type ReferralCode, type ReferralCommission } from '@/services/referral.service';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function statusChip(status: string) {
  const color = status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'default';
  return <Chip label={status} color={color} size="small" />;
}

export function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [codeRes, commRes] = await Promise.all([
        referralService.getMyCodes(),
        referralService.getMyCommissions(),
      ]);
      if (codeRes.success) {
        setCode(codeRes.code);
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

  const createCode = async () => {
    setGenerating(true);
    try {
      const res = await referralService.createCode();
      setCode(res);
      setSnackbar({ message: `Referral code created: ${res.code}`, severity: 'success' });
    } catch {
      setSnackbar({ message: 'Failed to create referral code', severity: 'error' });
    } finally {
      setGenerating(false);
    }
  };

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

  const refUrl = code ? `${window.location.origin}/ref/${code.code}` : null;

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        <MonetizationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Referrals
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Share your referral link to earn 40% commission on the first month of any deal you refer.
      </Typography>

      {/* Referral Code Card */}
      <Card sx={{ mb: 3, background: theme => theme.palette.mode === 'dark' ? '#2a2438' : undefined }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Your Referral Link
          </Typography>
          {code && refUrl ? (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <LinkIcon color="primary" />
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}
                >
                  {refUrl}
                </Typography>
                <Tooltip title="Copy link">
                  <IconButton size="small" onClick={() => copyToClipboard(refUrl, 'Link copied!')}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Code: <strong>{code.code}</strong> &middot; Created {new Date(code.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You haven't created a referral code yet.
              </Typography>
              <Button
                variant="contained"
                onClick={createCode}
                disabled={generating}
                startIcon={generating ? <CircularProgress size={16} /> : <LinkIcon />}
              >
                {generating ? 'Creating...' : 'Generate My Referral Code'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card sx={{ background: theme => theme.palette.mode === 'dark' ? '#2a2438' : undefined }}>
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
              <MonetizationOnIcon sx={{ fontSize: 40, color: '#5c5470', mb: 1 }} />
              <Typography color="text.secondary">No commissions yet.</Typography>
              <Typography variant="caption" color="text.disabled">
                Share your referral link to start earning.
              </Typography>
            </Box>
          ) : (
            <Table component={Paper} variant="outlined" sx={{ '& td, & th': { px: 1.5, py: 1 } }}>
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
          { step: '3', title: 'They purchase', desc: 'When a referred prospect purchases any of our 12 DFY services, you earn commission.' },
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
