import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  MenuItem,
  Button,
  Slider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';

export interface ClippingSettings {
  // Notifications
  notifyOnJobComplete: boolean;
  notifyOnJobFail: boolean;
  notifyOnClipUpload: boolean;
  emailNotifications: boolean;

  // Polling
  pollingEnabled: boolean;
  pollingInterval: number; // seconds

  // Display
  defaultJobsView: 'all' | 'active' | 'completed';
  defaultClipsView: 'all' | 'uploaded';
  itemsPerPage: number;

  // Auto-actions
  autoRetryFailedUploads: boolean;
  maxAutoRetries: number;

  // Advanced
  showDebugInfo: boolean;
  enableAnalytics: boolean;
  enableKeyboardShortcuts: boolean;
}

const DEFAULT_SETTINGS: ClippingSettings = {
  notifyOnJobComplete: true,
  notifyOnJobFail: true,
  notifyOnClipUpload: true,
  emailNotifications: false,
  pollingEnabled: true,
  pollingInterval: 5,
  defaultJobsView: 'all',
  defaultClipsView: 'all',
  itemsPerPage: 12,
  autoRetryFailedUploads: false,
  maxAutoRetries: 3,
  showDebugInfo: false,
  enableAnalytics: true,
  enableKeyboardShortcuts: true,
};

const STORAGE_KEY = 'clipping_settings';

export function ClippingSettingsPanel() {
  const [settings, setSettings] = useState<ClippingSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleChange = <K extends keyof ClippingSettings>(
    key: K,
    value: ClippingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasUnsavedChanges(false);
      // Apply settings to app
      window.dispatchEvent(new CustomEvent('clipping:settings-changed', { detail: settings }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      {hasUnsavedChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have unsaved changes. Click "Save Settings" to apply them.
        </Alert>
      )}

      {/* Notifications Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyOnJobComplete}
                onChange={(e) => handleChange('notifyOnJobComplete', e.target.checked)}
              />
            }
            label="Notify when jobs complete"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyOnJobFail}
                onChange={(e) => handleChange('notifyOnJobFail', e.target.checked)}
              />
            }
            label="Notify when jobs fail"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyOnClipUpload}
                onChange={(e) => handleChange('notifyOnClipUpload', e.target.checked)}
              />
            }
            label="Notify when clips are uploaded"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Email notifications
                <Chip label="Coming Soon" size="small" color="info" />
              </Box>
            }
            disabled
          />
        </Box>
      </Paper>

      {/* Polling Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6">Real-time Updates</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={settings.pollingEnabled}
              onChange={(e) => handleChange('pollingEnabled', e.target.checked)}
            />
          }
          label="Enable real-time job polling"
          sx={{ mb: 2 }}
        />

        {settings.pollingEnabled && (
          <Box sx={{ px: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Polling Interval: {settings.pollingInterval} seconds
            </Typography>
            <Slider
              value={settings.pollingInterval}
              onChange={(_, value) => handleChange('pollingInterval', value as number)}
              min={3}
              max={30}
              step={1}
              marks={[
                { value: 3, label: '3s' },
                { value: 10, label: '10s' },
                { value: 30, label: '30s' },
              ]}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              Faster polling = more real-time but higher server load
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Display Preferences */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Display Preferences
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Default Jobs View"
            size="small"
            value={settings.defaultJobsView}
            onChange={(e) => handleChange('defaultJobsView', e.target.value as any)}
          >
            <MenuItem value="all">All Jobs</MenuItem>
            <MenuItem value="active">Active Only</MenuItem>
            <MenuItem value="completed">Completed Only</MenuItem>
          </TextField>

          <TextField
            select
            label="Default Clips View"
            size="small"
            value={settings.defaultClipsView}
            onChange={(e) => handleChange('defaultClipsView', e.target.value as any)}
          >
            <MenuItem value="all">All Clips</MenuItem>
            <MenuItem value="uploaded">Uploaded Only</MenuItem>
          </TextField>

          <TextField
            type="number"
            label="Items per Page"
            size="small"
            value={settings.itemsPerPage}
            onChange={(e) => handleChange('itemsPerPage', parseInt(e.target.value))}
            inputProps={{ min: 6, max: 50, step: 6 }}
            helperText="Number of clips to load at once"
          />
        </Box>
      </Paper>

      {/* Auto-actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Automation
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={settings.autoRetryFailedUploads}
              onChange={(e) => handleChange('autoRetryFailedUploads', e.target.checked)}
            />
          }
          label="Auto-retry failed clip uploads"
          sx={{ mb: 2 }}
        />

        {settings.autoRetryFailedUploads && (
          <TextField
            type="number"
            label="Max Auto-retries"
            size="small"
            value={settings.maxAutoRetries}
            onChange={(e) => handleChange('maxAutoRetries', parseInt(e.target.value))}
            inputProps={{ min: 1, max: 10 }}
            helperText="Maximum automatic retry attempts"
            sx={{ ml: 4 }}
          />
        )}
      </Paper>

      {/* Advanced Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Advanced
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableKeyboardShortcuts}
                onChange={(e) => handleChange('enableKeyboardShortcuts', e.target.checked)}
              />
            }
            label="Enable keyboard shortcuts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.enableAnalytics}
                onChange={(e) => handleChange('enableAnalytics', e.target.checked)}
              />
            }
            label="Enable analytics tracking"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showDebugInfo}
                onChange={(e) => handleChange('showDebugInfo', e.target.checked)}
              />
            }
            label="Show debug information (developers)"
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={handleReset}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
}
