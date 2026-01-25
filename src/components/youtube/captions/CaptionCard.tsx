import { Card, CardContent, Box, Typography, IconButton, Chip } from '@mui/material';
import { Delete as DeleteIcon, Subtitles as SubtitlesIcon } from '@mui/icons-material';
import type { Caption } from '@/types/caption.types';

export interface CaptionCardProps {
  caption: Caption;
  onDelete: (captionId: string) => void;
}

export function CaptionCard({ caption, onDelete }: CaptionCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SubtitlesIcon color="action" />
            <Box>
              <Typography variant="subtitle1">{caption.name || caption.language}</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Language: {caption.language}
                </Typography>
                {caption.is_draft && <Chip label="Draft" size="small" color="warning" />}
              </Box>
            </Box>
          </Box>
          <IconButton color="error" onClick={() => onDelete(caption.caption_id)} aria-label="delete caption">
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
