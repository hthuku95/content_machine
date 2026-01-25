import { useState } from 'react';
import { Paper, Box, TextField, Button, Stack, Typography } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import type { AnalyticsDateRange } from '@/types/analytics.types';

export interface DateRangePickerProps {
  onDateRangeChange: (dateRange: AnalyticsDateRange) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function DateRangePicker({ onDateRangeChange, initialStartDate, initialEndDate }: DateRangePickerProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultStartDate = initialStartDate || format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(initialEndDate || today);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    // Validate dates
    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('Start date must be before end date');
      return;
    }

    if (end > new Date()) {
      setError('End date cannot be in the future');
      return;
    }

    setError(null);
    onDateRangeChange({
      start_date: startDate,
      end_date: endDate,
    });
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setError(null);

    onDateRangeChange({
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd'),
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Date Range
      </Typography>

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setError(null);
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: today }}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setError(null);
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: today }}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <Button variant="contained" onClick={handleApply} startIcon={<SearchIcon />}>
            Apply
          </Button>
        </Box>

        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
            Quick ranges:
          </Typography>
          <Button size="small" variant="outlined" onClick={() => handleQuickRange(7)}>
            Last 7 days
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleQuickRange(30)}>
            Last 30 days
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleQuickRange(90)}>
            Last 90 days
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
