import { Card, CardMedia, CardContent, CardActions, Typography, Box, Button, Chip } from '@mui/material';
import { OpenInNew as OpenInNewIcon, PlaylistAdd as PlaylistAddIcon } from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { VideoSearchResult as VideoSearchResultType } from '@/types/search.types';

export interface VideoSearchResultProps {
  result: VideoSearchResultType;
  onAddToPlaylist?: (videoId: string) => void;
}

export function VideoSearchResult({ result, onAddToPlaylist }: VideoSearchResultProps) {
  return (
    <Card>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        <CardMedia
          component="img"
          sx={{
            width: { xs: '100%', sm: 200 },
            height: { xs: 150, sm: 120 },
            objectFit: 'cover',
          }}
          image={result.thumbnail_url}
          alt={result.title}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom noWrap title={result.title}>
              {result.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {result.channel_title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
              }}
            >
              {result.description}
            </Typography>

            <Chip
              label={`Published ${formatDistanceToNow(parseISO(result.published_at), { addSuffix: true })}`}
              size="small"
              variant="outlined"
            />
          </CardContent>

          <CardActions>
            <Button
              size="small"
              startIcon={<OpenInNewIcon />}
              component="a"
              href={`https://youtube.com/watch?v=${result.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch
            </Button>
            {onAddToPlaylist && (
              <Button size="small" startIcon={<PlaylistAddIcon />} onClick={() => onAddToPlaylist(result.video_id)}>
                Add to Playlist
              </Button>
            )}
          </CardActions>
        </Box>
      </Box>
    </Card>
  );
}
