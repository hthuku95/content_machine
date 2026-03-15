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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { PATHS } from '@/routes/paths';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isClippingActive = () => {
    return location.pathname.startsWith('/clipping');
  };

  const isYoutubeActive = () => {
    return location.pathname.startsWith('/youtube');
  };

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
        },
      }}
    >
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive(PATHS.DASHBOARD)}
            onClick={() => handleNavigation(PATHS.DASHBOARD)}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton
            selected={isClippingActive()}
            onClick={() => setClippingOpen(!clippingOpen)}
          >
            <ListItemIcon>
              <ClippingIcon />
            </ListItemIcon>
            <ListItemText primary="YouTube Clipping" />
            {clippingOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={clippingOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.CLIPPING.OVERVIEW)}
              onClick={() => handleNavigation(PATHS.CLIPPING.OVERVIEW)}
            >
              <ListItemIcon>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.CLIPPING.SOURCE_CHANNELS)}
              onClick={() => handleNavigation(PATHS.CLIPPING.SOURCE_CHANNELS)}
            >
              <ListItemIcon>
                <VideoLibraryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Source Channels" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.CLIPPING.LINKAGES)}
              onClick={() => handleNavigation(PATHS.CLIPPING.LINKAGES)}
            >
              <ListItemIcon>
                <LinkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Linkages" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.CLIPPING.JOBS)}
              onClick={() => handleNavigation(PATHS.CLIPPING.JOBS)}
            >
              <ListItemIcon>
                <JobIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Jobs" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.CLIPPING.CLIPS)}
              onClick={() => handleNavigation(PATHS.CLIPPING.CLIPS)}
            >
              <ListItemIcon>
                <MovieIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Clips Gallery" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton
            selected={isYoutubeActive()}
            onClick={() => setYoutubeOpen(!youtubeOpen)}
          >
            <ListItemIcon>
              <YouTubeIcon />
            </ListItemIcon>
            <ListItemText primary="YouTube" />
            {youtubeOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={youtubeOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.YOUTUBE.UPLOAD)}
              onClick={() => handleNavigation(PATHS.YOUTUBE.UPLOAD)}
            >
              <ListItemIcon>
                <UploadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Upload Video" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.YOUTUBE.UPLOADS)}
              onClick={() => handleNavigation(PATHS.YOUTUBE.UPLOADS)}
            >
              <ListItemIcon>
                <VideoLibraryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="My Videos" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.YOUTUBE.PLAYLISTS)}
              onClick={() => handleNavigation(PATHS.YOUTUBE.PLAYLISTS)}
            >
              <ListItemIcon>
                <PlaylistIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Playlists" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.YOUTUBE.ANALYTICS)}
              onClick={() => handleNavigation(PATHS.YOUTUBE.ANALYTICS)}
            >
              <ListItemIcon>
                <AnalyticsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.YOUTUBE.SEARCH)}
              onClick={() => handleNavigation(PATHS.YOUTUBE.SEARCH)}
            >
              <ListItemIcon>
                <SearchIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Search" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.YOUTUBE.COMMENTS)}
              onClick={() => handleNavigation(PATHS.YOUTUBE.COMMENTS)}
            >
              <ListItemIcon>
                <CommentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Comments" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.YOUTUBE.CAPTIONS)}
              onClick={() => handleNavigation(PATHS.YOUTUBE.CAPTIONS)}
            >
              <ListItemIcon>
                <CaptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Captions" />
            </ListItemButton>

            <ListItemButton
              sx={{ pl: 4 }}
              selected={isActive(PATHS.CHANNELS.CONNECTED)}
              onClick={() => handleNavigation(PATHS.CHANNELS.CONNECTED)}
            >
              <ListItemIcon>
                <ChannelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Channels" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton
            selected={isActive(PATHS.VIDEO_TOOLS)}
            onClick={() => handleNavigation(PATHS.VIDEO_TOOLS)}
          >
            <ListItemIcon>
              <VideoToolsIcon />
            </ListItemIcon>
            <ListItemText primary="Video Tools" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton
            selected={isActive(PATHS.SETTINGS.ROOT)}
            onClick={() => handleNavigation(PATHS.SETTINGS.ROOT)}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
