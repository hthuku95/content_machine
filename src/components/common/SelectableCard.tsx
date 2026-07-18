import { Box, Checkbox, Card } from '@mui/material';
import type { CardProps } from '@mui/material';
import { useState } from 'react';

interface SelectableCardProps extends Omit<CardProps, 'onSelect'> {
  id: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onRangeSelect?: (id: string, shiftKey: boolean) => void;
  children: React.ReactNode;
  selectionMode?: boolean;
}

export function SelectableCard({
  id,
  selected,
  onSelect,
  onRangeSelect,
  children,
  selectionMode = false,
  sx,
  ...cardProps
}: SelectableCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // If shift key is held and we have range select handler
    if (e.shiftKey && onRangeSelect) {
      onRangeSelect(id, true);
      return;
    }

    // If checkbox is clicked or selection mode is active
    if (selectionMode || selected) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(id);
  };

  const showCheckbox = selectionMode || selected || isHovered;

  return (
    <Box
      sx={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        {...cardProps}
        sx={{
          ...sx,
          cursor: selectionMode ? 'pointer' : undefined,
          border: selected ? '2px solid' : '1px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          '&:hover': {
            borderColor: selected ? 'primary.main' : 'primary.light',
            transform: selected ? 'scale(1.02)' : 'none',
          },
        }}
        onClick={handleClick}
      >
        {children}
      </Card>

      {/* Floating Checkbox */}
      {showCheckbox && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10,
            bgcolor: 'background.paper',
            borderRadius: '50%',
            boxShadow: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            opacity: selected || isHovered ? 1 : 0.7,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected}
            onChange={handleCheckboxChange}
            size="small"
            sx={{
              p: 0.5,
              '&:hover': {
                bgcolor: 'transparent',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
