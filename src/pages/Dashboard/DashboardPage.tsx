import {
  Box,
  Container,
  Typography,
  Grid,
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

export function DashboardPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <ContentCutIcon sx={{ fontSize: 48 }} />,
      title: 'YouTube Clipping',
      description: 'Automatically extract and republish viral clips from monitored channels',
      color: '#f44336',
      link: PATHS.CLIPPING.OVERVIEW,
      benefits: [
        'Monitor source channels for new content',
        'AI-powered viral moment detection',
        'Automated clipping and editing',
        'Scheduled posting to your channels',
      ],
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 48 }} />,
      title: 'YouTube Management',
      description: 'Complete YouTube video management with uploads, metadata editing, and scheduling',
      color: '#2196f3',
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
      color: '#4caf50',
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
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome to Content Machine
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto' }}>
            Your AI-Powered YouTube Content Automation Platform
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
        <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            What We Do
          </Typography>
          <Typography variant="body1" paragraph>
            Content Machine is an intelligent YouTube content automation platform that helps creators grow their
            channels by leveraging AI to find, extract, and republish viral content. Monitor popular channels, let our
            AI identify trending moments, and automatically publish clips to your own channels.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
            <Chip icon={<AutoAwesomeIcon />} label="AI-Powered" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip icon={<SpeedIcon />} label="Automated" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip icon={<SecurityIcon />} label="Secure OAuth" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Box>
        </Paper>

        {/* Main Features */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Core Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
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
                      component={RouterLink}
                      to={feature.link}
                      sx={{ bgcolor: feature.color }}
                    >
                      Get Started
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How It Works */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            How It Works
          </Typography>
          <Grid container spacing={3}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
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
                      color: 'white',
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
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* All Capabilities */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            All Capabilities
          </Typography>
          <Grid container spacing={2}>
            {capabilities.map((capability, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: 'primary.main' }}>{capability.icon}</Box>
                  <Typography variant="body1">{capability.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
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
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Quick Links
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.YOUTUBE.UPLOAD}
                startIcon={<CloudUploadIcon />}
              >
                Upload Video
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.CLIPPING.LINKAGES}
                startIcon={<ContentCutIcon />}
              >
                Clipping Linkages
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.YOUTUBE.ANALYTICS}
                startIcon={<AnalyticsIcon />}
              >
                View Analytics
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to={PATHS.CLIPPING.CLIPS}
                startIcon={<VideoLibraryIcon />}
              >
                Browse Clips
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
