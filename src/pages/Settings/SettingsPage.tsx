import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore, getEffectiveTheme } from '@/stores/uiStore';
import { ClippingSettingsPanel } from '@/components/clipping/ClippingSettingsPanel';
import { useClippingAccess } from '@/hooks/useClippingAccess';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useUIStore();
  const { hasAccess } = useClippingAccess();
  const effectiveTheme = getEffectiveTheme(themeMode);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account and preferences
      </Typography>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Profile" />
          <Tab label="Appearance" />
          {hasAccess && <Tab label="Clipping" />}
          <Tab label="Account" />
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Username
            </Typography>
            <Typography variant="body1">{user?.username}</Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{user?.email}</Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Theme</FormLabel>
            <RadioGroup
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value as 'light' | 'dark' | 'system')}
            >
              <FormControlLabel value="light" control={<Radio />} label="Light" />
              <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              <FormControlLabel
                value="system"
                control={<Radio />}
                label="System (Auto)"
              />
            </RadioGroup>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Current theme: {effectiveTheme}
          </Typography>
        </TabPanel>

        {hasAccess && (
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              YouTube Clipping Settings
            </Typography>
            <ClippingSettingsPanel />
          </TabPanel>
        )}

        <TabPanel value={tabValue} index={hasAccess ? 3 : 2}>
          <Typography variant="h6" gutterBottom>
            Account Actions
          </Typography>
          <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </TabPanel>
      </Paper>
    </Box>
  );
}
