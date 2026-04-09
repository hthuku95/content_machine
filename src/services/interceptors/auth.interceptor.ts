import { api } from '../api';
import toast from 'react-hot-toast';

// Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const errorMessage = error.response?.data?.message || '';

      // Auth endpoints (login/register/verify) returning 401 are credential errors,
      // not session expiry — let the calling code handle them, never auto-logout.
      if (
        requestUrl.includes('/api/auth/login') ||
        requestUrl.includes('/api/auth/register') ||
        requestUrl.includes('/api/auth/verify')
      ) {
        return Promise.reject(error);
      }

      // YouTube-specific token error (channel token, not app session)
      if (requestUrl.includes('/api/youtube/') || errorMessage.includes('Token expired')) {
        const msg = errorMessage || 'YouTube channel authentication failed';
        toast.error(`${msg}. Please reconnect your YouTube channel.`);
        // DON'T clear auth or redirect - user's app session is still valid
        return Promise.reject(error);
      }

      // General app auth error on a protected endpoint - session truly expired
      toast('Your session has expired. Logging you out...', {
        icon: '⚠️',
      });

      // Wait briefly so user sees the message
      setTimeout(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }, 2000);
    }
    return Promise.reject(error);
  }
);
