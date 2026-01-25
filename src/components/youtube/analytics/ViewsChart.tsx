import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

export interface ViewsDataPoint {
  date: string; // YYYY-MM-DD format
  views: number;
}

export interface ViewsChartProps {
  data: ViewsDataPoint[];
  title?: string;
}

export function ViewsChart({ data, title = 'Views Over Time' }: ViewsChartProps) {
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
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value: number) => [value.toLocaleString(), 'Views']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
