import { useState } from 'react';
import { Box, Typography, Container, Paper, GridLegacy as Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { Visibility as VisibilityIcon, ThumbUp as ThumbUpIcon, Comment as CommentIcon, Share as ShareIcon } from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { useConnectedChannels } from '@/hooks/useConnectedChannels';
import { useChannelAnalytics } from '@/hooks/useAnalytics';
import { MetricCard } from '@/components/youtube/analytics/MetricCard';
import { ViewsChart } from '@/components/youtube/analytics/ViewsChart';
import { EngagementChart } from '@/components/youtube/analytics/EngagementChart';
import { DateRangePicker } from '@/components/youtube/analytics/DateRangePicker';
import type { AnalyticsDateRange } from '@/types/analytics.types';

export function AnalyticsDashboard() {
  console.log('[AnalyticsDashboard] Component mounted');

  const { channels, isLoading: channelsLoading } = useConnectedChannels();
  console.log('[AnalyticsDashboard] Channels loaded:', { count: channels.length, isLoading: channelsLoading });

  const [selectedChannelId, setSelectedChannelId] = useState<number>(0);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: analytics, isLoading, error } = useChannelAnalytics(selectedChannelId, dateRange);

  if (error) {
    console.error('[AnalyticsDashboard] Error loading analytics:', error);
  }

  if (analytics) {
    console.log('[AnalyticsDashboard] Analytics loaded:', analytics);
  }

  // Generate mock chart data from analytics
  const generateChartData = () => {
    if (!analytics) return { views: [], engagement: [] };

    // For demonstration, create daily data points
    const days = 30;
    const viewsData = [];
    const engagementData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(dateRange.end_date), i), 'yyyy-MM-dd');
      const dayViews = Math.floor(analytics.metrics.views / days) + Math.random() * 1000;

      viewsData.push({
        date,
        views: Math.floor(dayViews),
      });

      engagementData.push({
        date,
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 30),
        shares: Math.floor(Math.random() * 20),
      });
    }

    return { views: viewsData, engagement: engagementData };
  };

  const chartData = generateChartData();

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View channel performance and analytics
        </Typography>

        <Grid container spacing={3}>
          {/* Channel Selector */}
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 1, sm: 2 } }}>
              <FormControl fullWidth disabled={channelsLoading}>
                <InputLabel>Select Channel</InputLabel>
                <Select
                  value={selectedChannelId}
                  onChange={(e) => {
                    const newChannelId = Number(e.target.value);
                    console.log('[AnalyticsDashboard] Action: Channel selected', newChannelId);
                    setSelectedChannelId(newChannelId);
                    console.log('[AnalyticsDashboard] State updated: selectedChannelId', newChannelId);
                  }}
                  label="Select Channel"
                >
                  <MenuItem value={0}>Select a channel...</MenuItem>
                  {channels.map((channel) => (
                    <MenuItem key={channel.id} value={channel.id}>
                      {channel.channel_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {channels.length === 0 && !channelsLoading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No channels connected. Please connect a YouTube channel first.
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Date Range Picker */}
          {selectedChannelId > 0 && (
            <Grid item xs={12}>
              <DateRangePicker
                onDateRangeChange={setDateRange}
                initialStartDate={dateRange.start_date}
                initialEndDate={dateRange.end_date}
              />
            </Grid>
          )}

          {/* Loading State */}
          {isLoading && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading analytics data...
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Error State */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">
                Failed to load analytics data. Please try again.
              </Alert>
            </Grid>
          )}

          {/* Analytics Data */}
          {analytics && !isLoading && (
            <>
              {/* Metric Cards */}
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Total Views"
                  value={analytics.metrics.views}
                  icon={<VisibilityIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Watch Time"
                  value={`${Math.floor(analytics.metrics.watch_time_minutes / 60)}h`}
                  icon={<ThumbUpIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Subscribers Gained"
                  value={analytics.metrics.subscribers_gained}
                  change={
                    analytics.metrics.subscribers_lost > 0
                      ? ((analytics.metrics.subscribers_gained - analytics.metrics.subscribers_lost) /
                          analytics.metrics.subscribers_lost) *
                        100
                      : 0
                  }
                  icon={<CommentIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Net Subscribers"
                  value={analytics.metrics.subscribers_gained - analytics.metrics.subscribers_lost}
                  icon={<ShareIcon />}
                />
              </Grid>

              {/* Views Chart */}
              <Grid item xs={12} lg={6}>
                <ViewsChart data={chartData.views} />
              </Grid>

              {/* Engagement Chart */}
              <Grid item xs={12} lg={6}>
                <EngagementChart data={chartData.engagement} />
              </Grid>
            </>
          )}

          {/* Empty State */}
          {!selectedChannelId && !channelsLoading && channels.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Select a Channel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a channel from the dropdown to view analytics
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}
