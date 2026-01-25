import { Box, Card, CardContent, Skeleton } from '@mui/material';

export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" width={80} height={24} />
        </Box>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="30%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export function ClipCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={180} />
      <CardContent>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={28} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="70%" />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="50%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export function JobCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="rectangular" width={100} height={24} />
        </Box>
        <Skeleton variant="text" width="50%" />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={8} width="100%" />
        </Box>
        <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}

interface GridSkeletonProps {
  count?: number;
  type?: 'card' | 'clip' | 'job';
  columns?: { xs?: number; sm?: number; md?: number };
}

export function GridSkeleton({ count = 6, type = 'card', columns = { xs: 1, md: 2 } }: GridSkeletonProps) {
  const SkeletonComponent = type === 'clip' ? ClipCardSkeleton : type === 'job' ? JobCardSkeleton : CardSkeleton;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: columns.sm ? `repeat(${columns.sm}, 1fr)` : undefined,
          md: `repeat(${columns.md || 2}, 1fr)`,
        },
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </Box>
  );
}
