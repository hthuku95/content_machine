import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

export interface EngagementDataPoint {
  date: string; // YYYY-MM-DD format
  likes: number;
  comments: number;
  shares: number;
}

export interface EngagementChartProps {
  data: EngagementDataPoint[];
  title?: string;
}

export function EngagementChart({ data, title = 'Engagement Metrics' }: EngagementChartProps) {
  const theme = useTheme();
  const formattedData = data.map((point) => ({
    ...point,
    displayDate: format(parseISO(point.date), 'MMM d'),
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value?: number) => (value ?? 0).toLocaleString()}
              />
              <Legend />
              <Bar dataKey="likes" fill={theme.palette.success.main} name="Likes" />
              <Bar dataKey="comments" fill={theme.palette.info.main} name="Comments" />
              <Bar dataKey="shares" fill={theme.palette.warning.main} name="Shares" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
