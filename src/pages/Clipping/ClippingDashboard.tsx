import { useState } from 'react';
import { Box, Typography, Card, CardContent, Divider, Button } from '@mui/material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import {
  Link as LinkIcon,
  Work as WorkIcon,
  Movie as MovieIcon,
  Visibility as ViewsIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { useLinkages } from '@/hooks/useLinkages';
import { useJobPolling } from '@/hooks/useJobPolling';
import { useClips } from '@/hooks/useClips';
import { JobStatusCard } from '@/components/clipping/JobStatusCard';
import { DashboardAnalytics } from '@/components/clipping/analytics/DashboardAnalytics';
import { AnalyticsExportDialog } from '@/components/clipping/AnalyticsExportDialog';
import { ClipRecommendations } from '@/components/clipping/analytics/ClipRecommendations';

export function ClippingDashboard() {
  console.log('[ClippingDashboard] Component mounted');

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { linkages } = useLinkages();
  const { jobs } = useJobPolling();
  const { clips } = useClips({ limit: 10 });

  console.log('[ClippingDashboard] Data loaded:', {
    linkagesCount: linkages.length,
    jobsCount: jobs.length,
    clipsCount: clips.length
  });

  const activeLinkages = linkages.filter((l) => l.is_active).length;
  const activeJobs = jobs.filter((j) => j.status === 'processing' || j.status === 'pending').length;
  const totalClips = clips.length;
  const totalViews = clips.reduce((sum, clip) => sum + clip.views_count, 0);

  const activeJobsList = jobs.filter((j) => j.status === 'processing').slice(0, 5);

  return (
    <AccessGate>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }} gutterBottom>
              YouTube Clipping Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor your clipping operations and performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => {
                console.log('[ClippingDashboard] Action: Open export dialog');
                setExportDialogOpen(true);
                console.log('[ClippingDashboard] State updated: Export dialog opened');
              }}
            >
              Export Data
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => {
                console.log('[ClippingDashboard] Action: Refresh page');
                window.location.reload();
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinkIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{activeLinkages}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active Linkages
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <WorkIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{activeJobs}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active Jobs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MovieIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{totalClips}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Clips Generated
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ViewsIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{totalViews.toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Views
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Box>

        {activeJobsList.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Active Jobs
            </Typography>
            <ResponsiveGrid columns={{ xs: 1, md: 2 }} spacing={2}>
              {activeJobsList.map((job) => (
                <JobStatusCard key={job.id} job={job} />
              ))}
            </ResponsiveGrid>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* AI Recommendations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            AI-Powered Insights
          </Typography>
          <ClipRecommendations clips={clips} />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Analytics & Performance
          </Typography>
          <DashboardAnalytics linkages={linkages} jobs={jobs} clips={clips} />
        </Box>

        <AnalyticsExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          linkages={linkages}
          jobs={jobs}
          clips={clips}
        />
      </Box>
    </AccessGate>
  );
}
