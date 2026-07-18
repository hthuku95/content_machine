import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import type { FilterPreset } from '@/hooks/useFilterPresets';

interface FilterPresetsManagerProps<T = any> {
  presets: FilterPreset<T>[];
  onApplyPreset: (filters: T) => void;
  onSavePreset: (name: string, filters: T) => void;
  onDeletePreset: (id: string) => void;
  onUpdatePreset: (id: string, updates: Partial<FilterPreset<T>>) => void;
  currentFilters: T;
  hasActiveFilters: boolean;
}

export function FilterPresetsManager<T = any>({
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  onUpdatePreset,
  currentFilters,
  hasActiveFilters,
}: FilterPresetsManagerProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<FilterPreset<T> | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleApplyPreset = (preset: FilterPreset<T>) => {
    onApplyPreset(preset.filters);
    handleCloseMenu();
  };

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
    handleCloseMenu();
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim(), currentFilters);
      setPresetName('');
      setSaveDialogOpen(false);
    }
  };

  const handleDeletePreset = (id: string) => {
    if (window.confirm('Delete this preset?')) {
      onDeletePreset(id);
    }
  };

  const handleEditPreset = (preset: FilterPreset<T>) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
  };

  const handleUpdatePreset = () => {
    if (editingPreset && presetName.trim()) {
      onUpdatePreset(editingPreset.id, { name: presetName.trim() });
      setEditingPreset(null);
      setPresetName('');
    }
  };

  return (
    <>
      <Button
        size="small"
        startIcon={presets.length > 0 ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        onClick={handleOpenMenu}
        sx={{ minWidth: 120 }}
      >
        Presets {presets.length > 0 && `(${presets.length})`}
      </Button>

      {/* Presets Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { minWidth: 250 },
        }}
      >
        {presets.length > 0 && (
          <>
            {presets.map((preset) => (
              <MenuItem
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <StarIcon fontSize="small" color="primary" />
                <Typography sx={{ flexGrow: 1 }}>{preset.name}</Typography>
              </MenuItem>
            ))}
            <Divider />
          </>
        )}

        <MenuItem onClick={handleSaveClick} disabled={!hasActiveFilters}>
          <SaveIcon fontSize="small" sx={{ mr: 1 }} />
          Save Current Filters
        </MenuItem>

        {presets.length > 0 && (
          <MenuItem onClick={() => { setManageDialogOpen(true); handleCloseMenu(); }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Manage Presets
          </MenuItem>
        )}
      </Menu>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Filter Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="e.g., Failed jobs last 7 days"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSavePreset();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePreset} variant="contained" disabled={!presetName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Presets Dialog */}
      <Dialog
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Filter Presets</DialogTitle>
        <DialogContent>
          {editingPreset ? (
            <Box sx={{ py: 2 }}>
              <TextField
                autoFocus
                fullWidth
                label="Preset Name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={() => { setEditingPreset(null); setPresetName(''); }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePreset} variant="contained">
                  Update
                </Button>
              </Box>
            </Box>
          ) : (
            <List>
              {presets.map((preset) => (
                <ListItem key={preset.id}>
                  <ListItemText
                    primary={preset.name}
                    secondary={`Created ${new Date(preset.createdAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleEditPreset(preset)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleDeletePreset(preset.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
