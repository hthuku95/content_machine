// Import interceptors to register them
import './interceptors/auth.interceptor';
import './interceptors/error.interceptor';

// Export API client
export { api } from './api';

// Export services
export * from './background.service';
