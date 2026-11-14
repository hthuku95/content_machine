import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Autocomplete, Button, CircularProgress,
  Alert, Link,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { educationService, type EducationLinkage, type EducationJob } from '@/services/education.service';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success',
  generating: 'info',
  uploading: 'info',
  queued: 'warning',
  failed: 'error',
};

const CADENCE_NOTE =
  'Videos are generated automatically at the configured cadence (default: 1 video every 2 days per channel — admin-configurable up to 4/day). Each video is researched, scripted, narrated, rendered, and QA-verified before posting.';

export function EducationPostingsPage() {
  const [linkages, setLinkages] = useState<EducationLinkage[]>([]);
  const [jobs, setJobs] = useState<EducationJob[]>([]);
  const [topics, setTopics] = useState<string[]>(['History']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [l, j, t] = await Promise.all([
        educationService.listLinkages(),
        educationService.listJobs(100),
        educationService.getTopics(),
      ]);
      setLinkages(l);
      setJobs(j);
      setTopics(t);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load education postings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleTopicChange = async (channelDbId: number, topic: string | null) => {
    if (!topic) return;
    setSaving(channelDbId);
    try {
      await educationService.setTopic(channelDbId, topic);
      setLinkages(ls =>
        ls.map(l => (l.channel_db_id === channelDbId ? { ...l, topic, is_default_topic: topic === 'History' } : l))
      );
    } catch (err: any) {
      setError(err?.message ?? 'Failed to set topic');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        Educational Videos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        AI-generated educational lessons posted to your connected YouTube channels. {CADENCE_NOTE}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Channel Topics
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Channel</TableCell>
                <TableCell sx={{ width: 340 }}>Educational Topic</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linkages.map(l => (
                <TableRow key={l.channel_db_id}>
                  <TableCell>{l.channel_name}</TableCell>
                  <TableCell>
                    <Autocomplete
                      size="small"
                      freeSolo
                      options={topics}
                      value={l.topic}
                      onChange={(_, v) => handleTopicChange(l.channel_db_id, v)}
                      renderInput={params => (
                        <TextField {...params} placeholder="Pick a topic or type a custom one" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={l.is_default_topic ? 'default (History)' : 'custom'}
                      color={l.is_default_topic ? 'default' : 'primary'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {linkages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Connect a YouTube channel first (Channels → Connected).
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Posting History
            </Typography>
            <Button size="small" onClick={load}>Refresh</Button>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>Channel</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Video</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map(j => (
                <TableRow key={j.id}>
                  <TableCell>{new Date(j.created_at).toLocaleString()}</TableCell>
                  <TableCell>{j.channel_name}</TableCell>
                  <TableCell>{j.topic}</TableCell>
                  <TableCell>
                    <Chip size="small" color={STATUS_COLOR[j.status] ?? 'default'} label={j.status} />
                    {j.status === 'failed' && j.error && (
                      <Typography variant="caption" display="block" color="error">
                        {j.error.slice(0, 120)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {j.youtube_url ? (
                      <Link href={j.youtube_url} target="_blank" rel="noopener">
                        Watch <OpenInNewIcon fontSize="inherit" />
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No education videos posted yet — the worker generates them on schedule.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
