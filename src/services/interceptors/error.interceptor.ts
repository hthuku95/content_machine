import { api } from '../api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    // Extract endpoint information for better error context
    const endpoint = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'REQUEST';

    // Don't show toast for 401 errors (handled by auth interceptor)
    if (error.response?.status === 401) {
      console.warn(`[API Auth Error] ${method} ${endpoint}: Unauthorized`);
      return Promise.reject(error);
    }

    // Extract error message
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Log error for debugging
    console.error(`[API Error] ${method} ${endpoint}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: errorMessage,
      data: error.response?.data,
      requestData: error.config?.data,
    });

    // Show user-friendly toast with endpoint context
    const displayMessage =
      error.response?.status === 403
        ? 'You do not have permission to perform this action'
        : error.response?.status === 404
        ? 'The requested resource was not found'
        : error.response?.status === 500
        ? 'Server error. Please try again later.'
        : errorMessage;

    toast.error(displayMessage);

    return Promise.reject(error);
  }
);
