import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/stores/uiStore';

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile, setSidebarOpen]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar onMenuClick={handleDrawerToggle} />

      {isMobile ? (
        <Sidebar
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          variant="temporary"
        />
      ) : (
        <Sidebar open={sidebarOpen} variant="permanent" />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
