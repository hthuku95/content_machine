import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { ViewModule as GridIcon, ViewList as ListIcon } from '@mui/icons-material';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: ViewMode | null) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      aria-label="view mode"
    >
      <ToggleButton value="grid" aria-label="grid view">
        <Tooltip title="Grid view">
          <GridIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="list" aria-label="list view">
        <Tooltip title="Table view">
          <ListIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
