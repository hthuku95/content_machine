import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Fade,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  ToggleOn as EnableIcon,
  ToggleOff as DisableIcon,
  Refresh as RetryIcon,
  Download as ExportIcon,
} from '@mui/icons-material';

export interface BulkAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  disabled?: boolean;
  tooltip?: string;
}

interface BulkActionToolbarProps {
  selectedCount: number;
  onClear: () => void;
  actions?: BulkAction[];
  position?: 'top' | 'bottom';
}

export function BulkActionToolbar({
  selectedCount,
  onClear,
  actions = [],
  position = 'bottom',
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <Fade in={selectedCount > 0}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          [position]: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minWidth: 400,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'primary.main',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            {selectedCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCount === 1 ? 'item' : 'items'} selected
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {actions.map((action, index) => (
            <Tooltip key={index} title={action.tooltip || action.label}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color={action.color || 'primary'}
                  startIcon={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              </span>
            </Tooltip>
          ))}
        </Box>

        <Tooltip title="Clear selection">
          <IconButton size="small" onClick={onClear}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Fade>
  );
}

// Predefined action sets for common use cases
export const bulkActionSets = {
  linkages: (
    onEnable: () => void,
    onDisable: () => void,
    onDelete: () => void,
    disableStates?: { enable?: boolean; disable?: boolean; delete?: boolean }
  ): BulkAction[] => [
    {
      label: 'Enable',
      icon: <EnableIcon />,
      onClick: onEnable,
      color: 'success',
      disabled: disableStates?.enable,
      tooltip: 'Enable selected linkages',
    },
    {
      label: 'Disable',
      icon: <DisableIcon />,
      onClick: onDisable,
      color: 'warning',
      disabled: disableStates?.disable,
      tooltip: 'Disable selected linkages',
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: onDelete,
      color: 'error',
      disabled: disableStates?.delete,
      tooltip: 'Delete selected linkages',
    },
  ],

  sourceChannels: (
    onEnable: () => void,
    onDisable: () => void,
    onDelete: () => void,
    disableStates?: { enable?: boolean; disable?: boolean; delete?: boolean }
  ): BulkAction[] => [
    {
      label: 'Activate',
      icon: <EnableIcon />,
      onClick: onEnable,
      color: 'success',
      disabled: disableStates?.enable,
      tooltip: 'Activate selected channels',
    },
    {
      label: 'Deactivate',
      icon: <DisableIcon />,
      onClick: onDisable,
      color: 'warning',
      disabled: disableStates?.disable,
      tooltip: 'Deactivate selected channels',
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: onDelete,
      color: 'error',
      disabled: disableStates?.delete,
      tooltip: 'Delete selected channels',
    },
  ],

  jobs: (
    onCancel: () => void,
    onRetry: () => void,
    onExport: () => void,
    disableStates?: { cancel?: boolean; retry?: boolean; export?: boolean }
  ): BulkAction[] => [
    {
      label: 'Cancel',
      icon: <CloseIcon />,
      onClick: onCancel,
      color: 'error',
      disabled: disableStates?.cancel,
      tooltip: 'Cancel selected jobs',
    },
    {
      label: 'Retry',
      icon: <RetryIcon />,
      onClick: onRetry,
      color: 'primary',
      disabled: disableStates?.retry,
      tooltip: 'Retry selected failed jobs',
    },
    {
      label: 'Export',
      icon: <ExportIcon />,
      onClick: onExport,
      color: 'secondary',
      disabled: disableStates?.export,
      tooltip: 'Export job data',
    },
  ],

  clips: (
    onRepost: () => void,
    onExport: () => void,
    onDelete: () => void,
    disableStates?: { repost?: boolean; export?: boolean; delete?: boolean }
  ): BulkAction[] => [
    {
      label: 'Repost',
      icon: <RetryIcon />,
      onClick: onRepost,
      color: 'primary',
      disabled: disableStates?.repost,
      tooltip: 'Repost selected failed clips',
    },
    {
      label: 'Export',
      icon: <ExportIcon />,
      onClick: onExport,
      color: 'secondary',
      disabled: disableStates?.export,
      tooltip: 'Export clip data',
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: onDelete,
      color: 'error',
      disabled: disableStates?.delete,
      tooltip: 'Delete selected clips',
    },
  ],
};
