import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar, DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from './Sidebar';
import { useUIStore } from '@/stores/uiStore';
import { useChannelHealthMonitor } from '@/hooks/useChannelHealthMonitor';

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();
  const location = useLocation();

  // Monitor channel health and show notifications
  useChannelHealthMonitor();

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
          p: { xs: 2, sm: 3 },
          // Explicitly compute remaining width so transitions are smooth
          width: isMobile
            ? '100%'
            : `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)`,
          minWidth: 0,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ flex: 1 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
