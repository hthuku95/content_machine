import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Checkbox,
  Link as MuiLink,
  Avatar,
  Typography,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  OpenInNew as OpenInNewIcon,
  Replay as ReplayIcon,
  ThumbUp as LikesIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import type { ExtractedClip, UploadStatus } from '@/types/clipping.types';
import { PATHS } from '@/routes/paths';
import { format } from 'date-fns';

interface ClipsTableViewProps {
  clips: ExtractedClip[];
  onRepost?: (id: string) => void;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
}

const STATUS_COLORS: Record<UploadStatus, 'default' | 'primary' | 'success' | 'error'> = {
  pending: 'default',
  uploading: 'primary',
  uploaded: 'success',
  failed: 'error',
};

export function ClipsTableView({
  clips,
  onRepost,
  selectionMode = false,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
}: ClipsTableViewProps) {
  const allSelected = clips.length > 0 && clips.every(clip => selectedIds.has(clip.id));
  const someSelected = clips.some(clip => selectedIds.has(clip.id)) && !allSelected;

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {selectionMode && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            <TableCell width={80}>Thumbnail</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell align="right">Views</TableCell>
            <TableCell align="right">Likes</TableCell>
            <TableCell align="right">Engagement</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clips.map((clip) => {
            const isSelected = selectedIds.has(clip.id);
            const canRepost = clip.upload_status === 'failed';
            const engagementRate = clip.views_count > 0
              ? ((clip.likes_count / clip.views_count) * 100).toFixed(2)
              : '0.00';

            return (
              <TableRow
                key={clip.id}
                hover
                selected={isSelected}
                sx={{
                  cursor: selectionMode ? 'pointer' : 'default',
                }}
                onClick={selectionMode ? () => onSelect?.(clip.id) : undefined}
              >
                {selectionMode && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onSelect?.(clip.id)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  {clip.thumbnail_url ? (
                    <Avatar
                      src={clip.thumbnail_url}
                      alt={clip.title}
                      variant="rounded"
                      sx={{ width: 64, height: 36 }}
                    />
                  ) : (
                    <Avatar variant="rounded" sx={{ width: 64, height: 36 }}>
                      ?
                    </Avatar>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <MuiLink
                    component={RouterLink}
                    to={PATHS.CLIPPING.CLIP_DETAILS(clip.id)}
                    underline="hover"
                    sx={{ fontWeight: 500 }}
                  >
                    {clip.title}
                  </MuiLink>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {clip.tags?.slice(0, 3).map((tag, i) => (
                      <Chip key={i} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={clip.upload_status.toUpperCase()}
                    color={STATUS_COLORS[clip.upload_status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{clip.duration_seconds}s</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <ViewIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">
                      {clip.views_count.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <LikesIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">
                      {clip.likes_count.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={parseFloat(engagementRate) > 5 ? 'success.main' : 'text.secondary'}
                  >
                    {engagementRate}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {format(new Date(clip.created_at), 'MMM d, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="View details">
                      <IconButton
                        component={RouterLink}
                        to={PATHS.CLIPPING.CLIP_DETAILS(clip.id)}
                        size="small"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {clip.youtube_url && (
                      <Tooltip title="Watch on YouTube">
                        <IconButton
                          href={clip.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canRepost && onRepost && (
                      <Tooltip title="Repost">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRepost(clip.id);
                          }}
                        >
                          <ReplayIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
