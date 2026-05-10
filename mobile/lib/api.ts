import axios, { AxiosError } from 'axios';
import { auth } from './firebase';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
    // Some older Android WebViews need explicit TLS hints in the User-Agent
    'Accept': 'application/json',
  },
  // Generous timeout for older / slower devices
  timeout: 30000, // 30 seconds
});

// Helper to fetch token with a timeout to prevent hanging requests
const getTokenWithTimeout = async (user: any, timeoutMs = 8000) => {
  return Promise.race([
    user.getIdToken(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase token fetch timeout')), timeoutMs)
    )
  ]);
};

// Request interceptor to attach Firebase ID token automatically
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await getTokenWithTimeout(user);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.warn('Error fetching Firebase token, proceeding without token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Checks if an error represents a request that was intentionally cancelled.
 * Older versions of Hermes / React Native report cancellation differently,
 * so we check several properties to be safe.
 */
function isCancelled(error: AxiosError | any): boolean {
  if (!error) return false;
  // axios ≥ 1.x uses CanceledError + code
  if (axios.isCancel(error)) return true;
  // Older axios / RN may set name to 'CanceledError' or 'AbortError'
  if (error.name === 'CanceledError' || error.name === 'AbortError') return true;
  // React Native's built-in fetch occasionally surfaces 'Request aborted'
  if (error.code === 'ERR_CANCELED') return true;
  return false;
}

// Response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | any) => {
    const config = error.config as any;

    // Don't retry intentionally cancelled requests
    if (isCancelled(error)) {
      return Promise.reject(error);
    }

    // Auto-logout or handle 401 Unauthorized
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Authentication error:', error.response.status);
    }

    // Don't retry if we've already retried or there's no config
    if (!config || config._retryCount >= 2) {
      return Promise.reject(error);
    }

    // Retry on network errors (no response) or 5xx server errors
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500 && error.response.status <= 599;

    if (isNetworkError || isServerError) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = config._retryCount * 1500; // 1.5s, then 3s
      console.log(`[API] Retry ${config._retryCount}/2 for ${config.url} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export { isCancelled };
export default api;
