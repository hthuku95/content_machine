import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  VideoLibrary as VideoLibraryIcon,
  ContentCut as ContentCutIcon,
  Analytics as AnalyticsIcon,
  CloudUpload as CloudUploadIcon,
  PlaylistPlay as PlaylistPlayIcon,
  Comment as CommentIcon,
  Subtitles as SubtitlesIcon,
  Search as SearchIcon,
  YouTube as YouTubeIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { useAuth } from '@/hooks/useAuth';
import { ChannelHealthWidget } from '@/components/dashboard/ChannelHealthWidget';
import { ResponsiveGrid } from '@/components/common/ResponsiveGrid';

export function DashboardPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <ContentCutIcon sx={{ fontSize: 48 }} />,
      title: 'Clip Campaigns',
      description: 'Daily short-form clips from Kick, Twitch, and YouTube sources — captioned, branded, auto-posted',
      iconColor: 'brand.main',
      link: PATHS.CLIPPING.OVERVIEW,
      benefits: [
        'Kick streamer VODs → viral highlights',
        'Twitch streams → daily short-form clips',
        'AI captions, branding, and thumbnails',
        'Auto-posting across connected accounts',
      ],
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 48 }} />,
      title: 'YouTube Management',
      description: 'Complete YouTube video management with uploads, metadata editing, and scheduling',
      iconColor: 'info.main',
      link: PATHS.YOUTUBE.UPLOADS,
      benefits: [
        'Resumable chunked video uploads',
        'Edit video metadata and thumbnails',
        'Schedule video publications',
        'Manage playlists',
      ],
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 48 }} />,
      title: 'Analytics & Insights',
      description: 'Track performance with real-time analytics and engagement metrics',
      iconColor: 'success.main',
      link: PATHS.YOUTUBE.ANALYTICS,
      benefits: [
        'View counts and watch time',
        'Engagement metrics (likes, comments, shares)',
        'Subscriber growth tracking',
        'Custom date range analysis',
      ],
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Connect Your YouTube Channel',
      description: 'Link your YouTube channel via secure Google OAuth. You can connect multiple channels.',
      icon: <YouTubeIcon />,
    },
    {
      step: 2,
      title: 'Set Up Source Channels',
      description: 'Add YouTube channels to monitor for new content. Our AI will watch for viral moments.',
      icon: <VideoLibraryIcon />,
    },
    {
      step: 3,
      title: 'Create Clipping Linkages',
      description: 'Link source channels to your destination channels. Define clipping rules and schedules.',
      icon: <ContentCutIcon />,
    },
    {
      step: 4,
      title: 'Let AI Do the Work',
      description: 'Our AI analyzes videos, extracts viral clips, and automatically posts them to your channels.',
      icon: <AutoAwesomeIcon />,
    },
  ];

  const capabilities = [
    { icon: <SearchIcon />, label: 'Video Search & Discovery' },
    { icon: <CommentIcon />, label: 'Comment Moderation' },
    { icon: <SubtitlesIcon />, label: 'Caption Management' },
    { icon: <PlaylistPlayIcon />, label: 'Playlist Organization' },
    { icon: <TrendingUpIcon />, label: 'Performance Analytics' },
    { icon: <SpeedIcon />, label: 'Automated Workflows' },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.75rem' },
            }}
          >
            Welcome to Content Machine
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 800, mx: 'auto', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Your AI Content Operations Platform
          </Typography>
          {user && (
            <Chip
              label={`Logged in as ${user.username}${user.is_superuser ? ' (Admin)' : ''}`}
              color="primary"
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        {/* What We Do */}
        <Paper
          sx={(theme) => ({
            p: { xs: 3, md: 4 },
            mb: 4,
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2a2438 0%, #5c5470 100%)'
                : 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
          })}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            What We Do
          </Typography>
          <Typography variant="body1" paragraph>
            Content Machine runs daily clip campaigns for clipping businesses: our AI watches Kick
            and Twitch streams, finds viral moments, edits them with captions and branding, and
            posts them to connected social accounts — plus full YouTube channel management and
            analytics in the same workspace.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
            <Chip icon={<AutoAwesomeIcon />} label="AI-Powered" sx={{ bgcolor: 'action.selected', color: 'text.primary' }} />
            <Chip icon={<SpeedIcon />} label="Automated" sx={{ bgcolor: 'action.selected', color: 'text.primary' }} />
            <Chip icon={<SecurityIcon />} label="Secure OAuth" sx={{ bgcolor: 'action.selected', color: 'text.primary' }} />
          </Box>
        </Paper>

        {/* Channel Health Widget */}
        <Box sx={{ mb: 4 }}>
          <ChannelHealthWidget />
        </Box>

        {/* Main Features */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Core Features
          </Typography>
          <ResponsiveGrid spacing={4} columns={{ xs: 1, md: 3 }}>
            {features.map((feature, index) => (
              <Card key={index} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ color: feature.iconColor, mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {feature.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List dense>
                      {feature.benefits.map((benefit, i) => (
                        <ListItem key={i} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={benefit}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={feature.link}
                    >
                      Get Started
                    </Button>
                  </CardActions>
                </Card>
            ))}
          </ResponsiveGrid>
        </Box>

        {/* How It Works */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            How It Works
          </Typography>
          <ResponsiveGrid spacing={3} columns={{ xs: 1, sm: 2, md: 4 }}>
            {howItWorks.map((step, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  position: 'relative',
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: 20,
                    }}
                  >
                    {step.step}
                  </Box>
                  <Box sx={{ color: 'primary.main', mt: 2, mb: 2 }}>{step.icon}</Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
              </Paper>
            ))}
          </ResponsiveGrid>
        </Box>

        {/* All Capabilities */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            All Capabilities
          </Typography>
          <ResponsiveGrid spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
            {capabilities.map((capability, index) => (
              <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: 'primary.main' }}>{capability.icon}</Box>
                <Typography variant="body1">{capability.label}</Typography>
              </Paper>
            ))}
          </ResponsiveGrid>
        </Box>

        {/* Getting Started */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body2" paragraph>
            To begin using Content Machine, you'll need to connect your YouTube channel. This grants us permission to
            manage your videos, playlists, and analytics. All connections use secure Google OAuth.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to={PATHS.CHANNELS.CONNECTED}
            startIcon={<YouTubeIcon />}
          >
            Connect YouTube Channel
          </Button>
        </Alert>

        {/* Quick Links */}
        <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Quick Links
          </Typography>
          <ResponsiveGrid spacing={2} columns={{ xs: 1, sm: 2, md: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.YOUTUBE.UPLOAD}
                startIcon={<CloudUploadIcon />}
              >
                Upload Video
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.CLIPPING.LINKAGES}
                startIcon={<ContentCutIcon />}
              >
                Clipping Linkages
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.YOUTUBE.ANALYTICS}
                startIcon={<AnalyticsIcon />}
              >
                View Analytics
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.CLIPPING.CLIPS}
                startIcon={<VideoLibraryIcon />}
              >
                Browse Clips
              </Button>
          </ResponsiveGrid>
        </Paper>
      </Box>
    </Container>
  );
}
