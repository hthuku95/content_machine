import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { ChannelLinkage, ClippingJob, ExtractedClip } from '@/types/clipping.types';
import { exportJobs, exportClips, exportLinkages, exportAnalytics, type AnalyticsSummary } from '@/utils/export';

interface AnalyticsExportDialogProps {
  open: boolean;
  onClose: () => void;
  linkages: ChannelLinkage[];
  jobs: ClippingJob[];
  clips: ExtractedClip[];
}

type ExportType = 'jobs' | 'clips' | 'linkages' | 'analytics' | 'all';
type ExportFormat = 'csv' | 'json';

export function AnalyticsExportDialog({
  open,
  onClose,
  linkages,
  jobs,
  clips,
}: AnalyticsExportDialogProps) {
  const [exportType, setExportType] = useState<ExportType>('analytics');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const handleExport = () => {
    switch (exportType) {
      case 'jobs':
        exportJobs(jobs, format);
        break;

      case 'clips':
        exportClips(clips, format);
        break;

      case 'linkages':
        exportLinkages(linkages, format);
        break;

      case 'analytics': {
        const uploadedClips = clips.filter(c => c.upload_status === 'uploaded');
        const totalViews = uploadedClips.reduce((sum, c) => sum + c.views_count, 0);
        const totalLikes = uploadedClips.reduce((sum, c) => sum + c.likes_count, 0);
        const avgEngagement = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : '0.00';

        const summary: AnalyticsSummary = {
          total_linkages: linkages.length,
          active_linkages: linkages.filter(l => l.is_active).length,
          total_jobs: jobs.length,
          completed_jobs: jobs.filter(j => j.status === 'completed').length,
          failed_jobs: jobs.filter(j => j.status === 'failed').length,
          job_success_rate: jobs.length > 0
            ? `${((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100).toFixed(2)}%`
            : '0%',
          total_clips: clips.length,
          uploaded_clips: uploadedClips.length,
          total_views: totalViews,
          total_likes: totalLikes,
          avg_engagement_rate: `${avgEngagement}%`,
          generated_at: new Date().toISOString(),
        };

        exportAnalytics(summary, format);
        break;
      }

      case 'all': {
        exportJobs(jobs, format);
        exportClips(clips, format);
        exportLinkages(linkages, format);

        // Also export analytics
        const uploadedClips = clips.filter(c => c.upload_status === 'uploaded');
        const totalViews = uploadedClips.reduce((sum, c) => sum + c.views_count, 0);
        const totalLikes = uploadedClips.reduce((sum, c) => sum + c.likes_count, 0);

        const summary: AnalyticsSummary = {
          total_linkages: linkages.length,
          active_linkages: linkages.filter(l => l.is_active).length,
          total_jobs: jobs.length,
          completed_jobs: jobs.filter(j => j.status === 'completed').length,
          failed_jobs: jobs.filter(j => j.status === 'failed').length,
          job_success_rate: jobs.length > 0
            ? `${((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100).toFixed(2)}%`
            : '0%',
          total_clips: clips.length,
          uploaded_clips: uploadedClips.length,
          total_views: totalViews,
          total_likes: totalLikes,
          avg_engagement_rate: totalViews > 0
            ? `${((totalLikes / totalViews) * 100).toFixed(2)}%`
            : '0%',
          generated_at: new Date().toISOString(),
        };

        exportAnalytics(summary, 'json');
        break;
      }
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon />
          Export Analytics & Data
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Export your clipping data for backup, analysis, or integration with other tools.
        </Alert>

        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">What to export</FormLabel>
          <RadioGroup value={exportType} onChange={(e) => setExportType(e.target.value as ExportType)}>
            <FormControlLabel value="analytics" control={<Radio />} label="Analytics Summary" />
            <FormControlLabel
              value="jobs"
              control={<Radio />}
              label={`Jobs (${jobs.length} total)`}
            />
            <FormControlLabel
              value="clips"
              control={<Radio />}
              label={`Clips (${clips.length} total)`}
            />
            <FormControlLabel
              value="linkages"
              control={<Radio />}
              label={`Linkages (${linkages.length} total)`}
            />
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="Everything (All data + Analytics)"
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
          <FormLabel component="legend">Export format</FormLabel>
          <RadioGroup row value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
            <FormControlLabel value="csv" control={<Radio />} label="CSV (Excel)" />
            <FormControlLabel value="json" control={<Radio />} label="JSON (Technical)" />
          </RadioGroup>
        </FormControl>

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
              />
            }
            label="Include metadata and timestamps"
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Filename will include the current date. All exports are generated client-side and do not
          send data to any external servers.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button onClick={handleExport} variant="contained" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}
