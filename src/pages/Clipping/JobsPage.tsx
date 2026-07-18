import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import {
  Work as WorkIcon,
  FiberManualRecord as LiveIcon,
} from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { JobStatusCard } from '@/components/clipping/JobStatusCard';
import { JobsFilterPanel, type JobFilters } from '@/components/clipping/JobsFilterPanel';
import { useJobPolling } from '@/hooks/useJobPolling';
import { useJobs } from '@/hooks/useJobs';
import { useLinkages } from '@/hooks/useLinkages';

export function JobsPage() {
  console.log('[JobsPage] Component mounted');

  const [filters, setFilters] = useState<JobFilters>({});

  // Fetch linkages for filter dropdown
  const { linkages } = useLinkages();

  // Use polling hook for real-time updates
  const { jobs: pollingJobs, isLoading: isPollingLoading, isPolling } = useJobPolling();

  console.log('[JobsPage] Jobs loaded:', {
    pollingJobsCount: pollingJobs.length,
    isPolling,
    filters
  });

  // Use regular hook with API filters
  const apiFilters = {
    status: filters.status,
    linkage_id: filters.linkageId,
    start_date: filters.startDate,
    end_date: filters.endDate,
  };
  const { jobs: filteredJobs, isLoading: isFilteredLoading, cancelJob, retryJob } = useJobs(
    Object.values(apiFilters).some(v => v !== undefined) ? apiFilters : undefined
  );

  // Use polling jobs if no API filters, otherwise use filtered jobs
  const jobs = Object.values(apiFilters).some(v => v !== undefined) ? filteredJobs : pollingJobs;
  const isLoading = Object.values(apiFilters).some(v => v !== undefined) ? isFilteredLoading : isPollingLoading;

  // Apply client-side search filter
  const displayedJobs = useMemo(() => {
    console.log('[JobsPage] Filtering jobs:', { search: filters.search, totalJobs: jobs.length });
    if (!filters.search) return jobs;
    const searchLower = filters.search.toLowerCase();
    const filtered = jobs.filter(job =>
      job.source_video_title.toLowerCase().includes(searchLower)
    );
    console.log('[JobsPage] Filtered jobs:', filtered.length);
    return filtered;
  }, [jobs, filters.search]);

  return (
    <AccessGate>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4">Clipping Jobs</Typography>
              {isPolling && (
                <Chip
                  label="Live"
                  size="small"
                  color="success"
                  icon={<LiveIcon sx={{ fontSize: 12 }} />}
                  sx={{
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.6 },
                    },
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Monitor your active and completed clipping jobs
              {isPolling && ' (Auto-updating every 5 seconds)'}
            </Typography>
          </Box>
        </Box>

        <JobsFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          linkages={linkages}
        />

        {isLoading ? (
          <GridSkeleton count={4} type="job" columns={{ xs: 1, md: 2 }} />
        ) : displayedJobs.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Jobs Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.values(filters).some(v => v !== undefined)
                ? 'No jobs match your current filters'
                : 'Jobs will appear here when you create linkages and content is being processed'}
            </Typography>
          </Paper>
        ) : (
          <ResponsiveGrid columns={{ xs: 1, md: 2 }}>
            {displayedJobs.map((job) => (
              <JobStatusCard key={job.id} job={job} onCancel={cancelJob} onRetry={retryJob} />
            ))}
          </ResponsiveGrid>
        )}
      </Box>
    </AccessGate>
  );
}
