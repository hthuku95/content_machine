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
  Tooltip,
  IconButton,
  Box,
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
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  Storefront as GigIcon,
  ContentCut as ClipIcon,
  CollectionsBookmark as PortfolioIcon,
  PhotoCamera as InstagramIcon,
  Campaign as CampaignIcon,
  MonetizationOn as ReferralIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PATHS } from '@/routes/paths';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

export const DRAWER_WIDTH = 240;
export const DRAWER_WIDTH_COLLAPSED = 64;

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
  collapsed?: boolean;
}

function NavItem({ icon, label, active, onClick, indent = false, collapsed = false }: NavItemProps) {
  const button = (
    <ListItem disablePadding>
      <ListItemButton
        selected={active}
        onClick={onClick}
        sx={{
          pl: collapsed ? 0 : indent ? 4 : 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
          minHeight: 44,
          borderLeft: active && !collapsed ? '2px solid' : '2px solid transparent',
          borderColor: active && !collapsed ? 'primary.main' : 'transparent',
          '& .MuiListItemIcon-root': {
            color: active ? 'primary.main' : 'text.secondary',
            minWidth: collapsed ? 'unset' : 36,
            justifyContent: 'center',
          },
          '& .MuiListItemText-primary': {
            fontWeight: active ? 600 : 400,
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 36 }}>{icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={label} />}
      </ListItemButton>
    </ListItem>
  );

  if (collapsed) {
    return <Tooltip title={label} placement="right">{button}</Tooltip>;
  }
  return button;
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <Divider sx={{ my: 0.5 }} />;
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
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.is_staff || user?.is_superuser;
  const [youtubeOpen, setYoutubeOpen] = useState(true);

  // In temporary (mobile) mode, never apply mini/collapsed rendering
  const isCollapsed = variant === 'permanent' && sidebarCollapsed;
  const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isYoutubeActive = () => location.pathname.startsWith('/youtube');

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.2s ease',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          overflowY: 'auto',
          transition: 'width 0.2s ease',
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
        <SectionLabel label="Navigation" collapsed={isCollapsed} />
        <List disablePadding>
          <NavItem
            icon={<DashboardIcon />}
            label="Dashboard"
            active={isActive(PATHS.DASHBOARD)}
            onClick={() => handleNavigation(PATHS.DASHBOARD)}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<AgentIcon />}
            label="AI Agent"
            active={isActive(PATHS.AGENT_CHAT)}
            onClick={() => handleNavigation(PATHS.AGENT_CHAT)}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<InstagramIcon />}
            label="Instagram Leads"
            active={isActive(PATHS.INSTAGRAM_LEADS)}
            onClick={() => handleNavigation(PATHS.INSTAGRAM_LEADS)}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<PeopleIcon />}
            label="Prospects"
            active={isActive(PATHS.ADMIN.PROSPECTS)}
            onClick={() => handleNavigation(PATHS.ADMIN.PROSPECTS)}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<ReferralIcon />}
            label="Referrals"
            active={isActive(PATHS.REFERRALS)}
            onClick={() => handleNavigation(PATHS.REFERRALS)}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<PortfolioIcon />}
            label="Portfolio Samples"
            active={isActive(PATHS.PORTFOLIO_SAMPLES)}
            onClick={() => handleNavigation(PATHS.PORTFOLIO_SAMPLES)}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<CampaignIcon />}
            label="Campaigns"
            active={location.pathname.startsWith('/campaigns')}
            onClick={() => handleNavigation(PATHS.CAMPAIGNS.ROOT)}
            collapsed={isCollapsed}
          />
          <NavItem
            icon={<LinkIcon />}
            label="Social Accounts"
            active={isActive(PATHS.SOCIAL_ACCOUNTS)}
            onClick={() => handleNavigation(PATHS.SOCIAL_ACCOUNTS)}
            collapsed={isCollapsed}
          />
        </List>
      </motion.div>

      <Divider sx={{ my: 1 }} />

      {/* ADMIN group (staff/superuser only) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.025 }}
        >
          <SectionLabel label="Admin" collapsed={isCollapsed} />
          <List disablePadding>
            <NavItem
              icon={<AdminIcon />}
              label="Overview"
              active={isActive(PATHS.ADMIN.OVERVIEW)}
              onClick={() => handleNavigation(PATHS.ADMIN.OVERVIEW)}
              collapsed={isCollapsed}
            />
            <NavItem
              icon={<VideoLibraryIcon />}
              label="Deliveries"
              active={isActive(PATHS.ADMIN.DELIVERIES)}
              onClick={() => handleNavigation(PATHS.ADMIN.DELIVERIES)}
              collapsed={isCollapsed}
            />
            <NavItem
              icon={<CampaignIcon />}
              label="Campaigns"
              active={isActive(PATHS.ADMIN.CAMPAIGNS)}
              onClick={() => handleNavigation(PATHS.ADMIN.CAMPAIGNS)}
              collapsed={isCollapsed}
            />
            <NavItem
              icon={<AdminIcon />}
              label="Service Switches"
              active={isActive(PATHS.ADMIN.SERVICE_FLAGS)}
              onClick={() => handleNavigation(PATHS.ADMIN.SERVICE_FLAGS)}
              collapsed={isCollapsed}
            />
          </List>
        </motion.div>
      )}

      <Divider sx={{ my: 1 }} />

      {/* TOOLS group */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <SectionLabel label="Tools" collapsed={isCollapsed} />
        <List disablePadding>
          {/* Educational Videos section (Nov 13 2026: legacy clipping deprecated;
              the YouTube-API system now posts AI-generated educational videos) */}
          <NavItem
            icon={<ClippingIcon />}
            label="Educational Videos"
            active={isActive(PATHS.EDUCATION)}
            onClick={() => handleNavigation(PATHS.EDUCATION)}
            collapsed={isCollapsed}
          />

          {/* YouTube section */}
          {isCollapsed ? (
            <NavItem
              icon={<YouTubeIcon />}
              label="YouTube"
              active={isYoutubeActive()}
              onClick={() => handleNavigation(PATHS.YOUTUBE.UPLOADS)}
              collapsed
            />
          ) : (
            <>
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
            </>
          )}

          {/* Video Tools removed Nov 13 2026 (deprecated; no longer part of the product) */}
          {/* Gig Templates removed Nov 13 2026 (deprecated; no longer part of the product) */}
          {/* Manual Clipping removed Nov 13 2026 (deprecated; no longer part of the product) */}
        </List>
      </motion.div>

      <Divider sx={{ my: 1 }} />

      {/* SETTINGS group */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        style={{ flex: 1 }}
      >
        <List disablePadding>
          <NavItem
            icon={<SettingsIcon />}
            label="Settings"
            active={isActive(PATHS.SETTINGS.ROOT)}
            onClick={() => handleNavigation(PATHS.SETTINGS.ROOT)}
            collapsed={isCollapsed}
          />
        </List>
      </motion.div>

      {/* Collapse toggle — only on permanent (desktop) sidebar */}
      {variant === 'permanent' && (
        <Box
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: isCollapsed ? 'center' : 'flex-end',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton size="small" onClick={toggleSidebarCollapsed} sx={{ color: 'text.secondary' }}>
              {isCollapsed ? <ExpandIcon fontSize="small" /> : <CollapseIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Drawer>
  );
}
