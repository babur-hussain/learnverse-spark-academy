/**
 * 🔒 Security Middleware for LearnVerse
 * Handles security headers, rate limiting, and request validation
 */

import { NextFunction, Request, Response } from 'express';
import { getSecurityHeaders, createRateLimiter, validateCSRFToken } from '@/lib/security';

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};

const rateLimiter = createRateLimiter(rateLimitConfig);

// ============================================================================
// SECURITY MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Apply security headers to all responses
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  const headers = getSecurityHeaders();
  
  // Apply security headers
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Additional security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  
  next();
};

/**
 * Rate limiting middleware
 */
export const rateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const result = rateLimiter(clientIP);
  
  if (!result.allowed) {
    res.setHeader('X-RateLimit-Limit', rateLimitConfig.max.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return res.status(429).json({
      error: 'Too Many Requests',
      message: rateLimitConfig.message,
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    });
  }
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', rateLimitConfig.max.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
  
  next();
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF check for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || !validateCSRFToken(token, sessionToken)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};

/**
 * Input validation middleware
 */
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Input validation failed',
        details: error.errors || error.message
      });
    }
  };
};

/**
 * SQL injection prevention middleware
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);
  
  // Check for common SQL injection patterns
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    /(\b(and|or)\s+\d+\s*=\s*\d+)/i,
    /(\b(and|or)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(xp_|sp_)\w+)/i
  ];
  
  const allInput = `${body}${query}${params}`;
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(allInput)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Potentially malicious input detected'
      });
    }
  }
  
  next();
};

/**
 * XSS protection middleware
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  // Sanitize request body, query, and params
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

/**
 * Content type validation middleware
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
      });
    }
  
    next();
  };
};

/**
 * File upload security middleware
 */
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction): void => {
  // Check file size limits
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxFileSize) {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'File size exceeds maximum allowed limit'
    });
  }
  
  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
  const url = req.url.toLowerCase();
  
  if (suspiciousExtensions.some(ext => url.includes(ext))) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'File type not allowed'
    });
  }
  
  next();
};

/**
 * Authentication middleware
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token required'
    });
  }
  
  // Token validation would go here
  // For now, just check if token exists
  
  next();
};

/**
 * Role-based access control middleware
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // This would integrate with your authentication system
    // For now, it's a placeholder
    
    const userRole = req.headers['x-user-role'] as string;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// ============================================================================
// EXPORT ALL MIDDLEWARE
// ============================================================================

export default {
  securityHeaders,
  rateLimit,
  csrfProtection,
  validateInput,
  sqlInjectionProtection,
  xssProtection,
  validateContentType,
  fileUploadSecurity,
  requireAuth,
  requireRole,
};
