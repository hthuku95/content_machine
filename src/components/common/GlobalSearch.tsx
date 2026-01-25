import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Chip,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Link as LinkIcon,
  Work as WorkIcon,
  Movie as MovieIcon,
  VideoLibrary as VideoLibraryIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import type { SourceChannel, ChannelLinkage, ClippingJob, ExtractedClip } from '@/types/clipping.types';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  sourceChannels: SourceChannel[];
  linkages: ChannelLinkage[];
  jobs: ClippingJob[];
  clips: ExtractedClip[];
}

type SearchResult = {
  type: 'channel' | 'linkage' | 'job' | 'clip';
  id: string;
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
  score: number;
};

export function GlobalSearch({
  open,
  onClose,
  sourceChannels,
  linkages,
  jobs,
  clips,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const searchLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search source channels
    sourceChannels.forEach(channel => {
      const titleMatch = channel.channel_title.toLowerCase().includes(searchLower);
      const idMatch = channel.channel_id.toLowerCase().includes(searchLower);

      if (titleMatch || idMatch) {
        results.push({
          type: 'channel',
          id: channel.id,
          title: channel.channel_title,
          subtitle: `Channel ID: ${channel.channel_id}`,
          path: PATHS.CLIPPING.SOURCE_CHANNELS,
          icon: <VideoLibraryIcon color="primary" />,
          score: titleMatch ? 10 : 5,
        });
      }
    });

    // Search linkages
    linkages.forEach(linkage => {
      const sourceMatch = linkage.source_channel?.channel_title.toLowerCase().includes(searchLower);
      const destMatch = linkage.destination_channel_title?.toLowerCase().includes(searchLower);

      if (sourceMatch || destMatch) {
        results.push({
          type: 'linkage',
          id: linkage.id,
          title: `${linkage.source_channel?.channel_title} → ${linkage.destination_channel_title}`,
          subtitle: `${linkage.clips_per_video} clips per video`,
          path: PATHS.CLIPPING.LINKAGES,
          icon: <LinkIcon color="secondary" />,
          score: 8,
        });
      }
    });

    // Search jobs
    jobs.forEach(job => {
      const titleMatch = job.source_video_title.toLowerCase().includes(searchLower);
      const idMatch = job.source_video_id.toLowerCase().includes(searchLower);

      if (titleMatch || idMatch) {
        results.push({
          type: 'job',
          id: job.id,
          title: job.source_video_title,
          subtitle: `Status: ${job.status}`,
          path: PATHS.CLIPPING.JOB_DETAILS(job.id),
          icon: <WorkIcon color="info" />,
          score: titleMatch ? 9 : 6,
        });
      }
    });

    // Search clips
    clips.forEach(clip => {
      const titleMatch = clip.title.toLowerCase().includes(searchLower);
      const descMatch = clip.description.toLowerCase().includes(searchLower);
      const tagMatch = clip.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      if (titleMatch || descMatch || tagMatch) {
        results.push({
          type: 'clip',
          id: clip.id,
          title: clip.title,
          subtitle: `${clip.views_count.toLocaleString()} views`,
          path: PATHS.CLIPPING.CLIP_DETAILS(clip.id),
          icon: <MovieIcon color="success" />,
          score: titleMatch ? 10 : tagMatch ? 7 : 5,
        });
      }
    });

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score).slice(0, 20); // Top 20 results
  }, [query, sourceChannels, linkages, jobs, clips]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
    setQuery('');
  };

  const handleClose = () => {
    onClose();
    setQuery('');
  };

  const resultsByType = useMemo(() => {
    const grouped: Record<string, SearchResult[]> = {
      channel: [],
      linkage: [],
      job: [],
      clip: [],
    };

    results.forEach(result => {
      grouped[result.type].push(result);
    });

    return grouped;
  }, [results]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search channels, linkages, jobs, clips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {query.trim() === '' ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Start typing to search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search across all your channels, linkages, jobs, and clips
            </Typography>
          </Box>
        ) : results.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No results found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different search term
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 500, overflow: 'auto' }}>
            {resultsByType.clip.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" fontWeight="bold">
                    CLIPS ({resultsByType.clip.length})
                  </Typography>
                </Box>
                {resultsByType.clip.map(result => (
                  <ListItemButton key={result.id} onClick={() => handleSelect(result)}>
                    <ListItemIcon>{result.icon}</ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.subtitle}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                ))}
                <Divider />
              </>
            )}

            {resultsByType.job.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" fontWeight="bold">
                    JOBS ({resultsByType.job.length})
                  </Typography>
                </Box>
                {resultsByType.job.map(result => (
                  <ListItemButton key={result.id} onClick={() => handleSelect(result)}>
                    <ListItemIcon>{result.icon}</ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.subtitle}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                ))}
                <Divider />
              </>
            )}

            {resultsByType.linkage.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" fontWeight="bold">
                    LINKAGES ({resultsByType.linkage.length})
                  </Typography>
                </Box>
                {resultsByType.linkage.map(result => (
                  <ListItemButton key={result.id} onClick={() => handleSelect(result)}>
                    <ListItemIcon>{result.icon}</ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.subtitle}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                ))}
                <Divider />
              </>
            )}

            {resultsByType.channel.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" fontWeight="bold">
                    SOURCE CHANNELS ({resultsByType.channel.length})
                  </Typography>
                </Box>
                {resultsByType.channel.map(result => (
                  <ListItemButton key={result.id} onClick={() => handleSelect(result)}>
                    <ListItemIcon>{result.icon}</ListItemIcon>
                    <ListItemText
                      primary={result.title}
                      secondary={result.subtitle}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                ))}
              </>
            )}
          </List>
        )}

        <Box sx={{ p: 2, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Tip: Use Ctrl+K to open search from anywhere
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
