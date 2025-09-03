
// Production configuration constants
export const APP_CONFIG = {
  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // UI Configuration
  DEBOUNCE_DELAY: 300,
  PAGINATION_SIZE: 20,
  
  // Feature Flags
  FEATURES: {
    VIDEO_LIBRARY: true,
    LIVE_SESSIONS: true,
    FORUM: true,
    ADMIN_PANEL: true,
    GUARDIAN_DASHBOARD: true,
  },
  
  // File Upload Limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'mp4', 'avi'],
  
  // Cache Configuration
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes
};

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  ADMIN: '/admin',
  SUBJECT_MANAGEMENT: '/subject-management',
  GUARDIAN_DASHBOARD: '/guardian-dashboard',
  EXPLORE: '/explore',
  CATALOG: '/catalog',
  SIMPLE_CONTENT: '/simple-content',
} as const;

export const QUERY_KEYS = {
  SUBJECTS: ['subjects'],
  CHAPTERS: ['chapters'],
  RESOURCES: ['resources'],
  COURSES: ['courses'],
  CATEGORIES: ['categories'],
  USERS: ['users'],
} as const;
