import axios, { AxiosError } from 'axios';

// Module-level token provider, set by TokenSync component in the React tree.
// This avoids prop-drilling getToken through the entire app.
let _getToken: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (fn: (() => Promise<string | null>) | null) => {
  _getToken = fn;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const isHealthCheck = config.url?.endsWith('/healthz');
  if (!isHealthCheck && _getToken) {
    try {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token fetch failed — proceed without auth header; server will 401.
    }
  }
  return config;
});

/** Extract a human-readable message from an Axios error. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d: { msg: string }) => d.msg).join(', ');
    }
    if (error.response?.status === 401) return 'You are not authenticated.';
    if (error.response?.status === 403) return 'You do not have permission to do that.';
    if (error.response?.status === 404) return 'The requested resource was not found.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
