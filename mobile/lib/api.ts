import axios from 'axios';
import { auth } from './firebase';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase ID token automatically
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error fetching Firebase token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
