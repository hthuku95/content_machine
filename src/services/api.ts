import axios from 'axios';
import { config } from '@/config/config';

// Create axios instance
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Response interceptor will be added by auth.interceptor.ts
// Error interceptor will be added by error.interceptor.ts

export default api;
