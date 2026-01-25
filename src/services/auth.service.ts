import { api } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerifyResponse,
} from '@/types/auth.types';

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  /**
   * Verify current token and get user data
   */
  async verify(): Promise<VerifyResponse> {
    const response = await api.get<VerifyResponse>('/api/auth/verify');
    return response.data;
  },

  /**
   * Initiate Google OAuth flow
   * Redirects to backend OAuth endpoint
   */
  initiateGoogleOAuth(redirectTo?: string): void {
    const url = new URL('/api/auth/google', api.defaults.baseURL);
    if (redirectTo) {
      url.searchParams.set('redirect_to', redirectTo);
    }
    window.location.href = url.toString();
  },

  /**
   * Logout (client-side only - just clear token)
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};
