import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PATHS } from './paths';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { OAuthCallbackPage } from '@/pages/Auth/OAuthCallbackPage';
import { ClippingDashboard } from '@/pages/Clipping/ClippingDashboard';
import { SourceChannelsPage } from '@/pages/Clipping/SourceChannelsPage';
import { LinkagesPage } from '@/pages/Clipping/LinkagesPage';
import { JobsPage } from '@/pages/Clipping/JobsPage';
import { JobDetailPage } from '@/pages/Clipping/JobDetailPage';
import { ClipsGalleryPage } from '@/pages/Clipping/ClipsGalleryPage';
import { ClipDetailPage } from '@/pages/Clipping/ClipDetailPage';
import { ConnectedChannelsPage } from '@/pages/Channels/ConnectedChannelsPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { UploadPage } from '@/pages/YouTube/UploadPage';
import { UploadHistoryPage } from '@/pages/YouTube/UploadHistoryPage';
import { PlaylistsPage } from '@/pages/YouTube/PlaylistsPage';
import { AnalyticsDashboard } from '@/pages/YouTube/AnalyticsDashboard';
import { SearchPage } from '@/pages/YouTube/SearchPage';
import { CommentModerationPage } from '@/pages/YouTube/CommentModerationPage';
import { CaptionsPage } from '@/pages/YouTube/CaptionsPage';

export const router = createBrowserRouter([
  // Auth routes (no sidebar/topbar)
  {
    element: <AuthLayout />,
    children: [
      {
        path: PATHS.LOGIN,
        element: <LoginPage />,
      },
      {
        path: PATHS.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: PATHS.OAUTH_CALLBACK,
        element: <OAuthCallbackPage />,
      },
    ],
  },

  // App routes (with sidebar/topbar) - Protected
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: PATHS.DASHBOARD,
        element: <DashboardPage />,
      },
      // Clipping routes
      {
        path: PATHS.CLIPPING.OVERVIEW,
        element: <ClippingDashboard />,
      },
      {
        path: PATHS.CLIPPING.SOURCE_CHANNELS,
        element: <SourceChannelsPage />,
      },
      {
        path: PATHS.CLIPPING.LINKAGES,
        element: <LinkagesPage />,
      },
      {
        path: PATHS.CLIPPING.JOBS,
        element: <JobsPage />,
      },
      {
        path: '/clipping/jobs/:id',
        element: <JobDetailPage />,
      },
      {
        path: PATHS.CLIPPING.CLIPS,
        element: <ClipsGalleryPage />,
      },
      {
        path: '/clipping/clips/:id',
        element: <ClipDetailPage />,
      },
      // Channels routes
      {
        path: PATHS.CHANNELS.CONNECTED,
        element: <ConnectedChannelsPage />,
      },
      // YouTube routes
      {
        path: PATHS.YOUTUBE.UPLOAD,
        element: (
          <ErrorBoundary>
            <UploadPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.YOUTUBE.UPLOADS,
        element: (
          <ErrorBoundary>
            <UploadHistoryPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.YOUTUBE.PLAYLISTS,
        element: (
          <ErrorBoundary>
            <PlaylistsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.YOUTUBE.ANALYTICS,
        element: (
          <ErrorBoundary>
            <AnalyticsDashboard />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.YOUTUBE.SEARCH,
        element: (
          <ErrorBoundary>
            <SearchPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.YOUTUBE.COMMENTS,
        element: (
          <ErrorBoundary>
            <CommentModerationPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.YOUTUBE.CAPTIONS,
        element: (
          <ErrorBoundary>
            <CaptionsPage />
          </ErrorBoundary>
        ),
      },
      // Settings routes
      {
        path: PATHS.SETTINGS.ROOT,
        element: <SettingsPage />,
      },
    ],
  },

  // 404 page (no layout)
  {
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to={PATHS.NOT_FOUND} replace />,
  },
]);
