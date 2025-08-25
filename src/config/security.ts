/**
 * 🔒 Security Configuration for LearnVerse
 * Centralized security settings and policies
 */

export const SecurityConfig = {
  // ============================================================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================================================
  
  auth: {
    // JWT Configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      expiresIn: '24h',
      refreshExpiresIn: '7d',
      issuer: 'learnverse-spark-academy',
      audience: 'learnverse-users',
    },
    
    // Password Requirements
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxLength: 128,
    },
    
    // Session Configuration
    session: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict' as const,
    },
    
    // Rate Limiting for Auth Endpoints
    rateLimit: {
      login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
      register: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
      passwordReset: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
    },
  },
  
  // ============================================================================
  // API SECURITY
  // ============================================================================
  
  api: {
    // CORS Configuration
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:8080',
        'https://localhost:3000',
        'https://localhost:8080'
      ],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-Token',
        'X-Client-Info',
        'apikey'
      ],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      credentials: true,
      maxAge: 86400, // 24 hours
    },
    
    // Rate Limiting
    rateLimit: {
      global: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
      auth: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 requests per 15 minutes
      upload: { windowMs: 15 * 60 * 1000, max: 20 }, // 20 uploads per 15 minutes
      ai: { windowMs: 15 * 60 * 1000, max: 50 }, // 50 AI requests per 15 minutes
    },
    
    // Request Size Limits
    limits: {
      body: '10mb',
      urlencoded: '10mb',
      json: '10mb',
      text: '10mb',
    },
  },
  
  // ============================================================================
  // FILE UPLOAD SECURITY
  // ============================================================================
  
  upload: {
    // Allowed File Types
    allowedMimeTypes: [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Documents
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Text
      'text/plain', 'text/csv', 'text/html',
      // Archives
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      // Audio/Video
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm', 'video/ogg'
    ],
    
    // File Size Limits
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxTotalSize: 100 * 1024 * 1024, // 100MB per request
    
    // Blocked File Extensions
    blockedExtensions: [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.war',
      '.php', '.asp', '.aspx', '.jsp', '.pl', '.py', '.rb', '.sh', '.ps1'
    ],
    
    // Virus Scanning (if available)
    virusScan: {
      enabled: process.env.ENABLE_VIRUS_SCAN === 'true',
      maxScanTime: 30000, // 30 seconds
    },
  },
  
  // ============================================================================
  // DATABASE SECURITY
  // ============================================================================
  
  database: {
    // Connection Security
    ssl: process.env.NODE_ENV === 'production',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    
    // Query Security
    maxQueryTime: 30000, // 30 seconds
    maxResults: 1000, // Maximum results per query
    
    // Backup Security
    backup: {
      enabled: true,
      encryption: true,
      retention: 30, // days
    },
  },
  
  // ============================================================================
  // ENCRYPTION & HASHING
  // ============================================================================
  
  crypto: {
    // Hashing Algorithms
    hash: {
      algorithm: 'bcrypt',
      rounds: 12,
      saltLength: 16,
    },
    
    // Encryption
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      tagLength: 16,
    },
    
    // Key Derivation
    pbkdf2: {
      iterations: 100000,
      keyLength: 32,
      digest: 'sha256',
    },
  },
  
  // ============================================================================
  // LOGGING & MONITORING
  // ============================================================================
  
  logging: {
    // Security Event Logging
    security: {
      enabled: true,
      level: 'info',
      includePII: false, // Don't log personally identifiable information
    },
    
    // Audit Logging
    audit: {
      enabled: true,
      events: [
        'user.login', 'user.logout', 'user.register', 'user.password_change',
        'admin.action', 'file.upload', 'file.download', 'data.access'
      ],
    },
    
    // Error Logging
    errors: {
      enabled: true,
      level: 'error',
      includeStack: process.env.NODE_ENV !== 'production',
    },
  },
  
  // ============================================================================
  // THREAT PROTECTION
  // ============================================================================
  
  threats: {
    // SQL Injection Protection
    sqlInjection: {
      enabled: true,
      patterns: [
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
        /(\b(and|or)\s+\d+\s*=\s*\d+)/i,
        /(\b(and|or)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
        /(--|\/\*|\*\/|;)/,
        /(\b(xp_|sp_)\w+)/i
      ],
    },
    
    // XSS Protection
    xss: {
      enabled: true,
      sanitize: true,
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {}, // No attributes allowed
    },
    
    // CSRF Protection
    csrf: {
      enabled: true,
      tokenLength: 32,
      cookieName: 'csrf-token',
      headerName: 'X-CSRF-Token',
    },
    
    // Path Traversal Protection
    pathTraversal: {
      enabled: true,
      blockedPatterns: ['..', '~', '//'],
    },
  },
  
  // ============================================================================
  // COMPLIANCE & PRIVACY
  // ============================================================================
  
  compliance: {
    // GDPR Compliance
    gdpr: {
      enabled: true,
      dataRetention: {
        userData: 365, // days
        logs: 90, // days
        backups: 30, // days
      },
      userRights: ['access', 'rectification', 'erasure', 'portability'],
    },
    
    // Data Privacy
    privacy: {
      anonymizeLogs: true,
      maskSensitiveData: true,
      encryptionAtRest: true,
      encryptionInTransit: true,
    },
  },
  
  // ============================================================================
  // ENVIRONMENT-SPECIFIC SETTINGS
  // ============================================================================
  
  environment: {
    development: {
      debug: true,
      verbose: true,
      strictSSL: false,
    },
    production: {
      debug: false,
      verbose: false,
      strictSSL: true,
      forceHTTPS: true,
    },
    test: {
      debug: true,
      verbose: false,
      strictSSL: false,
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get environment-specific security configuration
 */
export const getSecurityConfig = (env: string = process.env.NODE_ENV || 'development') => {
  const baseConfig = SecurityConfig;
  const envConfig = SecurityConfig.environment[env as keyof typeof SecurityConfig.environment] || {};
  
  return {
    ...baseConfig,
    ...envConfig,
  };
};

/**
 * Check if security feature is enabled
 */
export const isSecurityFeatureEnabled = (feature: keyof typeof SecurityConfig.threats): boolean => {
  return SecurityConfig.threats[feature]?.enabled || false;
};

/**
 * Get allowed origins for CORS
 */
export const getAllowedOrigins = (): string[] => {
  return SecurityConfig.api.cors.allowedOrigins;
};

/**
 * Get rate limit configuration
 */
export const getRateLimitConfig = (endpoint: keyof typeof SecurityConfig.api.rateLimit) => {
  return SecurityConfig.api.rateLimit[endpoint];
};

export default SecurityConfig;
