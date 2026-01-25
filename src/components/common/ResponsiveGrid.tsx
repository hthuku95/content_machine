import { Box } from '@mui/material';
import { type ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  spacing?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function ResponsiveGrid({ children, spacing = 3, columns = { xs: 1, sm: 2, md: 2 } }: ResponsiveGridProps) {
  const gap = spacing * 8; // MUI spacing unit is 8px

  return (
    <Box
      sx={{
        display: 'grid',
        gap: `${gap}px`,
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 2}, 1fr)`,
          md: `repeat(${columns.md || 2}, 1fr)`,
          lg: `repeat(${columns.lg || columns.md || 3}, 1fr)`,
        },
      }}
    >
      {children}
    </Box>
  );
}
