import axios from 'axios';
import { auth } from './firebase';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Helper to fetch token with a timeout to prevent hanging requests
const getTokenWithTimeout = async (user: any, timeoutMs = 5000) => {
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

// Response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Auto-logout or handle 401 Unauthorized
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Authentication error:', error.response.status);
      // If we get an auth error, we might want to sign the user out or refresh the token
      // For now we just log it, but the UI should handle this rejection
    }

    // Don't retry if we've already retried
    if (!config || config._retry) {
      return Promise.reject(error);
    }

    // Retry on network errors or 5xx server errors
    if (!error.response || (error.response.status >= 500 && error.response.status <= 599)) {
      config._retry = true;
      console.log(`Retrying request to ${config.url}...`);
      
      // Delay before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
