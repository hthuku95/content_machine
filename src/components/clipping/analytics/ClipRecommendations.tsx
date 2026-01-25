import { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
  Psychology as AIIcon,
  Lightbulb as InsightIcon,
} from '@mui/icons-material';
import type { ExtractedClip } from '@/types/clipping.types';

interface ClipRecommendationsProps {
  clips: ExtractedClip[];
}

interface Recommendation {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  clips?: ExtractedClip[];
}

export function ClipRecommendations({ clips }: ClipRecommendationsProps) {
  const recommendations = useMemo((): Recommendation[] => {
    const uploadedClips = clips.filter(c => c.upload_status === 'uploaded');
    const failedClips = clips.filter(c => c.upload_status === 'failed');
    const recommendations: Recommendation[] = [];

    // High confidence clips waiting
    const pendingHighConfidence = clips.filter(
      c => c.upload_status === 'pending' &&
           c.ai_confidence_score !== null &&
           c.ai_confidence_score > 0.8
    );
    if (pendingHighConfidence.length > 0) {
      recommendations.push({
        type: 'info',
        title: `${pendingHighConfidence.length} high-confidence clips pending`,
        description: 'These clips have AI confidence scores above 80% and are likely to perform well',
        clips: pendingHighConfidence,
      });
    }

    // Low performing clips
    if (uploadedClips.length > 10) {
      const avgViews = uploadedClips.reduce((sum, c) => sum + c.views_count, 0) / uploadedClips.length;
      const lowPerforming = uploadedClips.filter(c => c.views_count < avgViews * 0.5);

      if (lowPerforming.length > uploadedClips.length * 0.3) {
        recommendations.push({
          type: 'warning',
          title: 'Many clips underperforming',
          description: `${lowPerforming.length} clips are getting less than 50% of average views. Consider adjusting linkage settings.`,
        });
      }
    }

    // Failed uploads need attention
    if (failedClips.length > 0) {
      recommendations.push({
        type: 'warning',
        title: `${failedClips.length} failed uploads`,
        description: 'Review and retry these clips to maximize content output',
        clips: failedClips,
      });
    }

    // Top performers to analyze
    const topPerformers = uploadedClips
      .filter(c => c.views_count > 1000)
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 3);

    if (topPerformers.length > 0) {
      const commonFactors = findCommonViralFactors(topPerformers);
      if (commonFactors.length > 0) {
        recommendations.push({
          type: 'success',
          title: 'Success pattern identified',
          description: `Your top clips share these viral factors: ${commonFactors.join(', ')}`,
        });
      }
    }

    // Engagement trends
    if (uploadedClips.length >= 5) {
      const recentClips = uploadedClips.slice(-5);
      const avgRecentEngagement = recentClips.reduce((sum, c) =>
        sum + (c.views_count > 0 ? (c.likes_count / c.views_count) * 100 : 0),
        0
      ) / recentClips.length;

      const olderClips = uploadedClips.slice(0, -5);
      const avgOlderEngagement = olderClips.length > 0
        ? olderClips.reduce((sum, c) =>
            sum + (c.views_count > 0 ? (c.likes_count / c.views_count) * 100 : 0),
          0) / olderClips.length
        : 0;

      if (avgRecentEngagement > avgOlderEngagement * 1.2) {
        recommendations.push({
          type: 'success',
          title: 'Improving engagement trend',
          description: `Recent clips show ${((avgRecentEngagement / avgOlderEngagement - 1) * 100).toFixed(0)}% better engagement`,
        });
      } else if (avgRecentEngagement < avgOlderEngagement * 0.8) {
        recommendations.push({
          type: 'warning',
          title: 'Declining engagement',
          description: 'Recent clips are getting less engagement. Review clip selection criteria.',
        });
      }
    }

    return recommendations;
  }, [clips]);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InsightIcon color="primary" />
            <Typography variant="h6">Insights & Recommendations</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Not enough data yet. Keep creating clips to get personalized recommendations!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InsightIcon color="primary" />
          <Typography variant="h6">Insights & Recommendations</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <List>
          {recommendations.map((rec, index) => (
            <ListItem
              key={index}
              alignItems="flex-start"
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                bgcolor: rec.type === 'success' ? 'success.light' : rec.type === 'warning' ? 'warning.light' : 'info.light',
                borderRadius: 1,
                mb: 1,
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {rec.type === 'success' && <TrophyIcon fontSize="small" />}
                {rec.type === 'warning' && <InsightIcon fontSize="small" />}
                {rec.type === 'info' && <AIIcon fontSize="small" />}
                <Typography variant="subtitle2">{rec.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {rec.description}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

/**
 * Find common viral factors among top clips
 */
function findCommonViralFactors(clips: ExtractedClip[]): string[] {
  if (clips.length === 0) return [];

  const factorCounts = new Map<string, number>();

  clips.forEach(clip => {
    if (clip.viral_factors) {
      clip.viral_factors.forEach(factor => {
        factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
      });
    }
  });

  // Return factors that appear in at least 50% of clips
  const threshold = clips.length * 0.5;
  return Array.from(factorCounts.entries())
    .filter(([_, count]) => count >= threshold)
    .map(([factor]) => factor)
    .slice(0, 3); // Top 3
}
