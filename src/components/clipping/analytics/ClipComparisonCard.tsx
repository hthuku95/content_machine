import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import type { ExtractedClip } from '@/types/clipping.types';

interface ClipComparisonCardProps {
  clip: ExtractedClip;
  averageViews: number;
  averageLikes: number;
  averageEngagement: number;
}

export function ClipComparisonCard({
  clip,
  averageViews,
  averageLikes,
  averageEngagement,
}: ClipComparisonCardProps) {
  const clipEngagement = clip.views_count > 0
    ? (clip.likes_count / clip.views_count) * 100
    : 0;

  const viewsPercentage = averageViews > 0
    ? ((clip.views_count / averageViews) * 100)
    : 0;

  const likesPercentage = averageLikes > 0
    ? ((clip.likes_count / averageLikes) * 100)
    : 0;

  const engagementPercentage = averageEngagement > 0
    ? ((clipEngagement / averageEngagement) * 100)
    : 0;

  const isTopPerformer = viewsPercentage > 150 && likesPercentage > 150;
  const isAboveAverage = viewsPercentage > 100 && likesPercentage > 100;
  const isBelowAverage = viewsPercentage < 80 || likesPercentage < 80;

  const getTrendIcon = (percentage: number) => {
    if (percentage > 120) return <TrendingUpIcon color="success" fontSize="small" />;
    if (percentage < 80) return <TrendingDownIcon color="error" fontSize="small" />;
    return <TrendingFlatIcon color="action" fontSize="small" />;
  };

  const getPerformanceColor = (percentage: number): 'success' | 'warning' | 'error' | 'default' => {
    if (percentage > 150) return 'success';
    if (percentage > 100) return 'warning';
    if (percentage < 80) return 'error';
    return 'default';
  };

  const getProgressColor = (percentage: number): 'success' | 'warning' | 'error' | 'inherit' => {
    const color = getPerformanceColor(percentage);
    return color === 'default' ? 'inherit' : color;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Performance vs Average</Typography>
          {isTopPerformer && (
            <Tooltip title="Top 10% performer!">
              <TrophyIcon color="warning" />
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Overall Performance Badge */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          {isTopPerformer && (
            <Chip label="Top Performer" color="success" sx={{ mb: 1 }} />
          )}
          {isAboveAverage && !isTopPerformer && (
            <Chip label="Above Average" color="warning" sx={{ mb: 1 }} />
          )}
          {isBelowAverage && (
            <Chip label="Below Average" color="error" sx={{ mb: 1 }} />
          )}
          {!isTopPerformer && !isAboveAverage && !isBelowAverage && (
            <Chip label="Average" color="default" sx={{ mb: 1 }} />
          )}
        </Box>

        {/* Views Comparison */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Views
              </Typography>
              {getTrendIcon(viewsPercentage)}
            </Box>
            <Chip
              label={`${viewsPercentage.toFixed(0)}% of avg`}
              size="small"
              color={getPerformanceColor(viewsPercentage)}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(viewsPercentage, 200)}
            color={getProgressColor(viewsPercentage)}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {clip.views_count.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg: {averageViews.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Likes Comparison */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Likes
              </Typography>
              {getTrendIcon(likesPercentage)}
            </Box>
            <Chip
              label={`${likesPercentage.toFixed(0)}% of avg`}
              size="small"
              color={getPerformanceColor(likesPercentage)}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(likesPercentage, 200)}
            color={getProgressColor(likesPercentage)}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {clip.likes_count.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg: {averageLikes.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Engagement Comparison */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Engagement
              </Typography>
              {getTrendIcon(engagementPercentage)}
            </Box>
            <Chip
              label={`${engagementPercentage.toFixed(0)}% of avg`}
              size="small"
              color={getPerformanceColor(engagementPercentage)}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(engagementPercentage, 200)}
            color={getProgressColor(engagementPercentage)}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {clipEngagement.toFixed(2)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg: {averageEngagement.toFixed(2)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
