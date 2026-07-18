// Authentication related types

export interface User {
  id: string;
  email: string;
  username: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at: string;
}

export interface JWTClaims {
  sub: string; // user_id
  email: string;
  username: string;
  exp: number;
  iat: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VerifyResponse {
  user: User;
}
