import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ChannelLinkage, ClippingJob, ExtractedClip } from '@/types/clipping.types';

interface DashboardAnalyticsProps {
  linkages: ChannelLinkage[];
  jobs: ClippingJob[];
  clips: ExtractedClip[];
}

export function DashboardAnalytics({ linkages, jobs, clips }: DashboardAnalyticsProps) {
  // Prepare linkage performance data
  const linkagePerformance = useMemo(() => {
    return linkages.map(linkage => {
      const linkageClips = clips.filter(c => c.linkage_id === linkage.id);
      const uploadedClips = linkageClips.filter(c => c.upload_status === 'uploaded');

      return {
        name: linkage.source_channel?.channel_title || 'Unknown',
        clips: linkageClips.length,
        uploaded: uploadedClips.length,
        views: uploadedClips.reduce((sum, c) => sum + c.views_count, 0),
        likes: uploadedClips.reduce((sum, c) => sum + c.likes_count, 0),
        successRate: linkageClips.length > 0
          ? Math.round((uploadedClips.length / linkageClips.length) * 100)
          : 0,
      };
    }).filter(l => l.clips > 0); // Only show linkages with clips
  }, [linkages, clips]);

  // Top performing clips
  const topClips = useMemo(() => {
    return [...clips]
      .filter(c => c.upload_status === 'uploaded')
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 5);
  }, [clips]);

  // Job status breakdown
  const jobStats = useMemo(() => {
    const stats = {
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      pending: jobs.filter(j => j.status === 'pending').length,
    };
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    return {
      ...stats,
      successRate: total > 0 ? Math.round((stats.completed / total) * 100) : 0,
    };
  }, [jobs]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Job Success Rate Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Job Success Rate
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h3" color="success.main">
              {jobStats.successRate}%
            </Typography>
            <TrendingIcon color="success" sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label={`${jobStats.completed} Completed`} color="success" size="small" />
            <Chip label={`${jobStats.failed} Failed`} color="error" size="small" />
            <Chip label={`${jobStats.processing} Processing`} color="primary" size="small" />
            <Chip label={`${jobStats.pending} Pending`} color="default" size="small" />
          </Box>
        </CardContent>
      </Card>

      {/* Linkage Performance Chart */}
      {linkagePerformance.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clips per Linkage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={linkagePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clips" fill="#8884d8" name="Total Clips" />
                <Bar dataKey="uploaded" fill="#82ca9d" name="Uploaded" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Clips */}
      {topClips.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Performing Clips
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Likes</TableCell>
                    <TableCell align="right">Engagement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topClips.map((clip) => (
                    <TableRow key={clip.id}>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {clip.title}
                      </TableCell>
                      <TableCell align="right">{clip.views_count.toLocaleString()}</TableCell>
                      <TableCell align="right">{clip.likes_count.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {clip.views_count > 0
                          ? `${((clip.likes_count / clip.views_count) * 100).toFixed(2)}%`
                          : '0%'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Linkage Stats Table */}
      {linkagePerformance.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Linkage Performance Summary
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Source Channel</TableCell>
                    <TableCell align="right">Clips</TableCell>
                    <TableCell align="right">Uploaded</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Total Views</TableCell>
                    <TableCell align="right">Total Likes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {linkagePerformance.map((linkage, index) => (
                    <TableRow key={index}>
                      <TableCell>{linkage.name}</TableCell>
                      <TableCell align="right">{linkage.clips}</TableCell>
                      <TableCell align="right">{linkage.uploaded}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${linkage.successRate}%`}
                          size="small"
                          color={linkage.successRate >= 80 ? 'success' : linkage.successRate >= 50 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="right">{linkage.views.toLocaleString()}</TableCell>
                      <TableCell align="right">{linkage.likes.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
