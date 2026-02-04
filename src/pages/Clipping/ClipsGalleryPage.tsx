import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import { Movie as MovieIcon } from '@mui/icons-material';
import { AccessGate } from '@/components/clipping/AccessGate';
import { ClipCard } from '@/components/clipping/ClipCard';
import { ClipsFilterPanel, type ClipFilters } from '@/components/clipping/ClipsFilterPanel';
import { useClips } from '@/hooks/useClips';
import { useLinkages } from '@/hooks/useLinkages';
import type { UploadStatus } from '@/types/clipping.types';

export function ClipsGalleryPage() {
  console.log('[ClipsGalleryPage] Component mounted');

  const [filters, setFilters] = useState<ClipFilters>({});

  // Fetch linkages for filter dropdown
  const { linkages } = useLinkages();

  // Build API filters
  const apiFilters = {
    upload_status: filters.uploadStatus,
    linkage_id: filters.linkageId,
    start_date: filters.startDate,
    end_date: filters.endDate,
  };

  const {
    clips,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    repostClip,
  } = useClips(
    Object.values(apiFilters).some(v => v !== undefined) ? apiFilters : undefined
  );

  console.log('[ClipsGalleryPage] Clips loaded:', { count: clips.length, isLoading, hasNextPage });

  // Apply client-side search and sort
  const displayedClips = useMemo(() => {
    console.log('[ClipsGalleryPage] Filtering and sorting clips:', filters);
    let result = [...clips];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(clip =>
        clip.title.toLowerCase().includes(searchLower) ||
        clip.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (filters.sortBy === 'views') {
      result.sort((a, b) => b.views_count - a.views_count);
    } else if (filters.sortBy === 'likes') {
      result.sort((a, b) => b.likes_count - a.likes_count);
    }
    // Default 'latest' is already sorted by creation time from API

    console.log('[ClipsGalleryPage] Displayed clips count:', result.length);
    return result;
  }, [clips, filters.search, filters.sortBy]);

  return (
    <AccessGate>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Clips Gallery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse and manage your extracted clips
          </Typography>
        </Box>

        <ClipsFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          linkages={linkages}
        />

        {isLoading ? (
          <GridSkeleton count={6} type="clip" columns={{ xs: 1, sm: 2, md: 3 }} />
        ) : displayedClips.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
            <MovieIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Clips Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.values(filters).some(v => v !== undefined)
                ? 'No clips match your current filters'
                : 'Clips will appear here once clipping jobs complete'}
            </Typography>
          </Paper>
        ) : (
          <>
            <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3 }}>
              {displayedClips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} onRepost={repostClip} />
              ))}
            </ResponsiveGrid>

            {hasNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    console.log('[ClipsGalleryPage] Action: Load more clips');
                    fetchNextPage();
                  }}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? <CircularProgress size={24} /> : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </AccessGate>
  );
}
