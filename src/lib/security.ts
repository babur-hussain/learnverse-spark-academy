/**
 * 🔒 Security Utilities for LearnVerse
 * Comprehensive security functions for input validation, sanitization, and protection
 */

import { z } from 'zod';

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

export const UserInputSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
});

export const SubjectInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(2000).optional(),
  icon: z.string().url('Invalid icon URL').optional(),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional(),
  categoryIds: z.array(z.string().uuid('Invalid category ID')).optional(),
  classId: z.string().uuid('Invalid class ID').optional(),
  collegeId: z.string().uuid('Invalid college ID').optional(),
});

export const CourseInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0, 'Price must be non-negative').max(999999.99, 'Price too high'),
  instructor_id: z.string().uuid('Invalid instructor ID').optional(),
  college_id: z.string().uuid('Invalid college ID').optional(),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional(),
  banner_url: z.string().url('Invalid banner URL').optional(),
});

export const AIQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(1000, 'Query too long').trim(),
  fileData: z.string().max(50000, 'File data too large').optional(),
  mode: z.enum(['normal', 'explain', 'detailed', 'analyze']).optional(),
  stream: z.boolean().optional(),
});

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove all HTML tags and entities
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize file names to prevent path traversal attacks
 */
export const sanitizeFileName = (fileName: string): string => {
  if (typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\.\./g, '_') // Prevent path traversal
    .replace(/^\./, '_') // Prevent hidden files
    .substring(0, 255); // Limit length
};

/**
 * Sanitize URLs to prevent open redirect attacks
 */
export const sanitizeUrl = (url: string): string | null => {
  if (typeof url !== 'string') return null;
  
  try {
    const parsed = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // Block common malicious domains (customize as needed)
    const blockedDomains = ['evil.com', 'malicious.site'];
    if (blockedDomains.some(domain => parsed.hostname.includes(domain))) {
      return null;
    }
    
    return url;
  } catch {
    return null;
  }
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate and sanitize user input using Zod schemas
 */
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${messages}`);
    }
    throw error;
  }
};

/**
 * Check if a string contains potentially malicious content
 */
export const containsMaliciousContent = (input: string): boolean => {
  if (typeof input !== 'string') return false;
  
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /vbscript:/gi, // VBScript protocol
    /data:/gi, // Data URLs
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, // Iframe tags
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, // Object tags
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, // Embed tags
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(input));
};

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Generate security headers for responses
 */
export const getSecurityHeaders = (): Record<string, string> => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
});

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const record = requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      requests.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true, remaining: config.max - 1, resetTime: now + config.windowMs };
    }
    
    if (record.count >= config.max) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }
    
    record.count++;
    return { allowed: true, remaining: config.max - record.count, resetTime: record.resetTime };
  };
};

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Generate a CSRF token
 */
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

/**
 * Validate a CSRF token
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length > 0;
};

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters long');
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Password should contain at least one lowercase letter');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Password should contain at least one uppercase letter');
  
  if (/[0-9]/.test(password)) score++;
  else feedback.push('Password should contain at least one number');
  
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Password should contain at least one special character');
  
  return {
    score,
    feedback,
    isStrong: score >= 4
  };
};

// ============================================================================
// EXPORT ALL SECURITY UTILITIES
// ============================================================================

export default {
  // Schemas
  UserInputSchema,
  SubjectInputSchema,
  CourseInputSchema,
  AIQuerySchema,
  
  // Sanitization
  sanitizeHtml,
  sanitizeFileName,
  sanitizeUrl,
  
  // Validation
  validateInput,
  containsMaliciousContent,
  
  // Headers
  getSecurityHeaders,
  
  // Rate Limiting
  createRateLimiter,
  
  // CSRF
  generateCSRFToken,
  validateCSRFToken,
  
  // Password
  checkPasswordStrength,
};
