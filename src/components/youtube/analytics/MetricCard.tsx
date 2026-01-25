import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

export interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  formatValue?: (value: number | string) => string;
}

function formatNumber(num: number | string): string {
  if (typeof num === 'string') return num;

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function MetricCard({ title, value, change, icon, formatValue }: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const hasChange = change !== undefined;
  const displayValue = formatValue ? formatValue(value) : formatNumber(value);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">{displayValue}</Typography>
            {hasChange && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {isPositive ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography variant="body2" color={isPositive ? 'success.main' : 'error.main'}>
                  {isPositive ? '+' : ''}
                  {change.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}
