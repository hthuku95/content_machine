import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PATHS } from './paths';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { OAuthCallbackPage } from '@/pages/Auth/OAuthCallbackPage';
import { ConnectedChannelsPage } from '@/pages/Channels/ConnectedChannelsPage';
import { EducationPostingsPage } from '@/pages/Education/EducationPostingsPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { UploadPage } from '@/pages/YouTube/UploadPage';
import { UploadHistoryPage } from '@/pages/YouTube/UploadHistoryPage';
import { PlaylistsPage } from '@/pages/YouTube/PlaylistsPage';
import { AnalyticsDashboard } from '@/pages/YouTube/AnalyticsDashboard';
import { SearchPage } from '@/pages/YouTube/SearchPage';
import { CommentModerationPage } from '@/pages/YouTube/CommentModerationPage';
import { CaptionsPage } from '@/pages/YouTube/CaptionsPage';
import { AgentChatPage } from '@/pages/AgentChat/AgentChatPage';
import { InstagramLeadsPage } from '@/pages/InstagramLeads/InstagramLeadsPage';
import { PortfolioSamplesPage } from '@/pages/PortfolioSamples/PortfolioSamplesPage';
import { ReferralsPage } from '@/pages/Referrals/ReferralsPage';
import CampaignsPage from '@/pages/Campaigns/CampaignsPage';
import NewCampaignPage from '@/pages/Campaigns/NewCampaignPage';
import CampaignDetailPage from '@/pages/Campaigns/CampaignDetailPage';
import SocialAccountsPage from '@/pages/Campaigns/SocialAccountsPage';
import { AdminOverviewPage } from '@/pages/Admin/AdminOverviewPage';
import { AdminDeliveriesPage } from '@/pages/Admin/AdminDeliveriesPage';
import { AdminProspectsPage } from '@/pages/Admin/AdminProspectsPage';
import { AdminCampaignsPage } from '@/pages/Admin/AdminCampaignsPage';
import { AdminServiceFlagsPage } from '@/pages/Admin/AdminServiceFlagsPage';

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
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      // Channels routes
      {
        path: PATHS.CHANNELS.CONNECTED,
        element: <ConnectedChannelsPage />,
      },
      // Education-posting routes (owner directive Nov 13-14 2026)
      {
        path: PATHS.EDUCATION,
        element: <EducationPostingsPage />,
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
      // Video Tools route
      ,
      // AI Agent Chat route
      {
        path: PATHS.AGENT_CHAT,
        element: (
          <ErrorBoundary>
            <AgentChatPage />
          </ErrorBoundary>
        ),
      },
      // Gig Templates route
      ,
      // Manual Clipping route
      ,
      // Instagram Lead Finder route
      {
        path: PATHS.INSTAGRAM_LEADS,
        element: (
          <ErrorBoundary>
            <InstagramLeadsPage />
          </ErrorBoundary>
        ),
      },
      // Portfolio samples route
      {
        path: PATHS.PORTFOLIO_SAMPLES,
        element: (
          <ErrorBoundary>
            <PortfolioSamplesPage />
          </ErrorBoundary>
        ),
      },
      // Referral program route
      {
        path: PATHS.REFERRALS,
        element: (
          <ErrorBoundary>
            <ReferralsPage />
          </ErrorBoundary>
        ),
      },
      // Social Media Campaigns routes
      {
        path: PATHS.CAMPAIGNS.ROOT,
        element: (
          <ErrorBoundary>
            <CampaignsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: PATHS.CAMPAIGNS.NEW,
        element: (
          <ErrorBoundary>
            <NewCampaignPage />
          </ErrorBoundary>
        ),
      },
      {
        path: '/campaigns/:id',
        element: (
          <ErrorBoundary>
            <CampaignDetailPage />
          </ErrorBoundary>
        ),
      },
      // Social Account Management
      {
        path: PATHS.SOCIAL_ACCOUNTS,
        element: (
          <ErrorBoundary>
            <SocialAccountsPage />
          </ErrorBoundary>
        ),
      },
      // Admin Dashboard (staff/superuser only)
      {
        path: PATHS.ADMIN.OVERVIEW,
        element: (
          <AdminRoute>
            <ErrorBoundary>
              <AdminOverviewPage />
            </ErrorBoundary>
          </AdminRoute>
        ),
      },
      {
        path: PATHS.ADMIN.DELIVERIES,
        element: (
          <AdminRoute>
            <ErrorBoundary>
              <AdminDeliveriesPage />
            </ErrorBoundary>
          </AdminRoute>
        ),
      },
      {
        path: PATHS.ADMIN.PROSPECTS,
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <AdminProspectsPage />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: PATHS.ADMIN.CAMPAIGNS,
        element: (
          <AdminRoute>
            <ErrorBoundary>
              <AdminCampaignsPage />
            </ErrorBoundary>
          </AdminRoute>
        ),
      },
      {
        path: PATHS.ADMIN.SERVICE_FLAGS,
        element: (
          <AdminRoute>
            <ErrorBoundary>
              <AdminServiceFlagsPage />
            </ErrorBoundary>
          </AdminRoute>
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
