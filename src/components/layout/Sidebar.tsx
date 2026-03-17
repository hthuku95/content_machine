import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Collapse,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ContentCut as ClippingIcon,
  VideoLibrary as VideoLibraryIcon,
  Link as LinkIcon,
  Work as JobIcon,
  Movie as MovieIcon,
  YouTube as YouTubeIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Upload as UploadIcon,
  PlaylistPlay as PlaylistIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Comment as CommentIcon,
  ClosedCaption as CaptionIcon,
  AccountCircle as ChannelIcon,
  BuildCircle as VideoToolsIcon,
  SmartToy as AgentIcon,
  SportsEsports as TwitchIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PATHS } from '@/routes/paths';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}

function NavItem({ icon, label, active, onClick, indent = false }: NavItemProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={active}
        onClick={onClick}
        sx={{
          pl: indent ? 4 : 2,
          borderLeft: active ? '2px solid' : '2px solid transparent',
          borderColor: active ? 'primary.main' : 'transparent',
          fontWeight: active ? 600 : 400,
          '& .MuiListItemIcon-root': {
            color: active ? 'primary.main' : 'text.secondary',
          },
          '& .MuiListItemText-primary': {
            fontWeight: active ? 600 : 400,
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 2,
        pt: 1.5,
        pb: 0.5,
        display: 'block',
        color: 'text.secondary',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontSize: '0.65rem',
        opacity: 0.7,
      }}
    >
      {label}
    </Typography>
  );
}

export function Sidebar({ open, onClose, variant = 'permanent' }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [clippingOpen, setClippingOpen] = useState(true);
  const [youtubeOpen, setYoutubeOpen] = useState(true);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isClippingActive = () => location.pathname.startsWith('/clipping');
  const isYoutubeActive = () => location.pathname.startsWith('/youtube');

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #2a2438 0%, #352f44 100%)'
              : theme.palette.background.paper,
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar />

      {/* NAVIGATION group */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0 }}
      >
        <SectionLabel label="Navigation" />
        <List disablePadding>
          <NavItem
            icon={<DashboardIcon />}
            label="Dashboard"
            active={isActive(PATHS.DASHBOARD)}
            onClick={() => handleNavigation(PATHS.DASHBOARD)}
          />
          <NavItem
            icon={<AgentIcon />}
            label="AI Agent"
            active={isActive(PATHS.AGENT_CHAT)}
            onClick={() => handleNavigation(PATHS.AGENT_CHAT)}
          />
        </List>
      </motion.div>

      <Divider sx={{ my: 1 }} />

      {/* TOOLS group */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <SectionLabel label="Tools" />
        <List disablePadding>
          {/* Clipping section */}
          <ListItem disablePadding>
            <ListItemButton
              selected={isClippingActive()}
              onClick={() => setClippingOpen(!clippingOpen)}
              sx={{
                borderLeft: isClippingActive() ? '2px solid' : '2px solid transparent',
                borderColor: isClippingActive() ? 'primary.main' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isClippingActive() ? 'primary.main' : 'text.secondary' }}>
                <ClippingIcon />
              </ListItemIcon>
              <ListItemText primary="YouTube Clipping" />
              {clippingOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={clippingOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <NavItem icon={<DashboardIcon fontSize="small" />} label="Overview" active={isActive(PATHS.CLIPPING.OVERVIEW)} onClick={() => handleNavigation(PATHS.CLIPPING.OVERVIEW)} indent />
              <NavItem icon={<VideoLibraryIcon fontSize="small" />} label="Source Channels" active={isActive(PATHS.CLIPPING.SOURCE_CHANNELS)} onClick={() => handleNavigation(PATHS.CLIPPING.SOURCE_CHANNELS)} indent />
              <NavItem icon={<LinkIcon fontSize="small" />} label="Linkages" active={isActive(PATHS.CLIPPING.LINKAGES)} onClick={() => handleNavigation(PATHS.CLIPPING.LINKAGES)} indent />
              <NavItem icon={<JobIcon fontSize="small" />} label="Jobs" active={isActive(PATHS.CLIPPING.JOBS)} onClick={() => handleNavigation(PATHS.CLIPPING.JOBS)} indent />
              <NavItem icon={<MovieIcon fontSize="small" />} label="Clips Gallery" active={isActive(PATHS.CLIPPING.CLIPS)} onClick={() => handleNavigation(PATHS.CLIPPING.CLIPS)} indent />
              <NavItem icon={<TwitchIcon fontSize="small" />} label="Twitch Mappings" active={isActive(PATHS.CLIPPING.TWITCH_MAPPINGS)} onClick={() => handleNavigation(PATHS.CLIPPING.TWITCH_MAPPINGS)} indent />
            </List>
          </Collapse>

          {/* YouTube section */}
          <ListItem disablePadding>
            <ListItemButton
              selected={isYoutubeActive()}
              onClick={() => setYoutubeOpen(!youtubeOpen)}
              sx={{
                borderLeft: isYoutubeActive() ? '2px solid' : '2px solid transparent',
                borderColor: isYoutubeActive() ? 'primary.main' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isYoutubeActive() ? 'primary.main' : 'text.secondary' }}>
                <YouTubeIcon />
              </ListItemIcon>
              <ListItemText primary="YouTube" />
              {youtubeOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={youtubeOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <NavItem icon={<UploadIcon fontSize="small" />} label="Upload Video" active={isActive(PATHS.YOUTUBE.UPLOAD)} onClick={() => handleNavigation(PATHS.YOUTUBE.UPLOAD)} indent />
              <NavItem icon={<VideoLibraryIcon fontSize="small" />} label="My Videos" active={isActive(PATHS.YOUTUBE.UPLOADS)} onClick={() => handleNavigation(PATHS.YOUTUBE.UPLOADS)} indent />
              <NavItem icon={<PlaylistIcon fontSize="small" />} label="Playlists" active={isActive(PATHS.YOUTUBE.PLAYLISTS)} onClick={() => handleNavigation(PATHS.YOUTUBE.PLAYLISTS)} indent />
              <NavItem icon={<AnalyticsIcon fontSize="small" />} label="Analytics" active={isActive(PATHS.YOUTUBE.ANALYTICS)} onClick={() => handleNavigation(PATHS.YOUTUBE.ANALYTICS)} indent />
              <NavItem icon={<SearchIcon fontSize="small" />} label="Search" active={isActive(PATHS.YOUTUBE.SEARCH)} onClick={() => handleNavigation(PATHS.YOUTUBE.SEARCH)} indent />
              <NavItem icon={<CommentIcon fontSize="small" />} label="Comments" active={isActive(PATHS.YOUTUBE.COMMENTS)} onClick={() => handleNavigation(PATHS.YOUTUBE.COMMENTS)} indent />
              <NavItem icon={<CaptionIcon fontSize="small" />} label="Captions" active={isActive(PATHS.YOUTUBE.CAPTIONS)} onClick={() => handleNavigation(PATHS.YOUTUBE.CAPTIONS)} indent />
              <NavItem icon={<ChannelIcon fontSize="small" />} label="Channels" active={isActive(PATHS.CHANNELS.CONNECTED)} onClick={() => handleNavigation(PATHS.CHANNELS.CONNECTED)} indent />
            </List>
          </Collapse>

          <NavItem
            icon={<VideoToolsIcon />}
            label="Video Tools"
            active={isActive(PATHS.VIDEO_TOOLS)}
            onClick={() => handleNavigation(PATHS.VIDEO_TOOLS)}
          />
        </List>
      </motion.div>

      <Divider sx={{ my: 1 }} />

      {/* SETTINGS group */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <List disablePadding>
          <NavItem
            icon={<SettingsIcon />}
            label="Settings"
            active={isActive(PATHS.SETTINGS.ROOT)}
            onClick={() => handleNavigation(PATHS.SETTINGS.ROOT)}
          />
        </List>
      </motion.div>
    </Drawer>
  );
}
