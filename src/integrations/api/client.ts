// API Client — Axios instance pointing to EC2 backend
// Automatically attaches Firebase Auth JWT to every request
import axios from 'axios';
import { auth } from '@/integrations/firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://13.206.99.198';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — attach Firebase JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn('Unauthorized — user may need to re-authenticate');
      } else if (status === 403) {
        console.warn('Forbidden — insufficient permissions');
      } else if (status === 500) {
        console.error('Server error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
