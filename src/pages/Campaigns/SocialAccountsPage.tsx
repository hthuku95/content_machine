import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Link as LinkIcon, ArrowBack, Refresh } from '@mui/icons-material';
import { socialService } from '@/services/social.service';
import { PATHS } from '@/routes/paths';

export default function SocialAccountsPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    try {
      const [p, a] = await Promise.all([
        socialService.listProfiles(),
        socialService.listAccounts(),
      ]);
      setProfiles(p);
      setAccounts(a);
    } catch (e) {
      console.error('Failed to load social accounts', e);
    }
  }

  async function syncAndLoad() {
    await socialService.syncMyAccounts();
    await load();
  }

  useEffect(() => { syncAndLoad(); }, []);

  async function handleCreateProfile() {
    if (!profileName) return;
    try {
      await socialService.createProfile(profileName);
      setSuccess('Profile created!');
      setProfileDialogOpen(false);
      setProfileName('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to create profile');
    }
  }

  async function handleConnect(platform: string) {
    const profileId = profiles[0]?.id;
    if (!profileId) {
      setError('Create a profile first');
      return;
    }
    try {
      const authUrl = await socialService.getConnectUrl(
        platform,
        profileId,
        `${window.location.origin}/social/accounts`,
      );
      window.open(authUrl, '_blank', 'width=600,height=700');
      // After the OAuth popup, Zernio redirects back to /social/accounts which
      // reloads the page and re-syncs. Also sync here in case the popup is
      // blocked and the user returns manually.
      setTimeout(() => syncAndLoad(), 5000);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Failed to get connect URL');
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(PATHS.CAMPAIGNS.ROOT)} sx={{ mb: 2 }}>
        Back to Campaigns
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Social Accounts</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh"><Button onClick={load} startIcon={<Refresh />}>Refresh</Button></Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setProfileDialogOpen(true)}>
            Create Profile
          </Button>
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={600} gutterBottom>Profiles</Typography>
      {profiles.length === 0 ? (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">No profiles yet. Create one to get started.</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<LinkIcon />} onClick={() => handleConnect('youtube')}>Connect YouTube</Button>
                    <Button size="small" startIcon={<LinkIcon />} onClick={() => handleConnect('tiktok')}>Connect TikTok</Button>
                    <Button size="small" startIcon={<LinkIcon />} onClick={() => handleConnect('instagram')}>Connect Instagram</Button>
                    <Button size="small" startIcon={<LinkIcon />} onClick={() => handleConnect('twitter')}>Connect X</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>Connected Accounts</Typography>
      {accounts.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">No accounts connected. Use the Connect buttons above to link your social platforms.</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Platform</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Connected</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map(a => (
                <TableRow key={a.id}>
                  <TableCell><Chip label={a.platform} size="small" color="info" variant="outlined" /></TableCell>
                  <TableCell>{a.account_name}</TableCell>
                  <TableCell>
                    <Chip label={a.status || 'active'} size="small" color={a.status === 'expired' ? 'error' : 'success'} />
                  </TableCell>
                  <TableCell>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Profile</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Profile Name" value={profileName} onChange={e => setProfileName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProfile} disabled={!profileName}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
