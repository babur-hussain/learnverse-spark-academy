#!/usr/bin/env node

/**
 * 🔒 Security Testing Script for LearnVerse
 * Tests various security measures and configurations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0
};

// Helper functions
const log = (message, color = colors.white) => {
  console.log(`${color}${message}${colors.reset}`);
};

const test = (name, testFn) => {
  results.total++;
  try {
    const result = testFn();
    if (result === true) {
      log(`✅ PASS: ${name}`, colors.green);
      results.passed++;
    } else if (result === 'warning') {
      log(`⚠️  WARN: ${name}`, colors.yellow);
      results.warnings++;
    } else {
      log(`❌ FAIL: ${name}`, colors.red);
      results.failed++;
    }
  } catch (error) {
    log(`❌ FAIL: ${name} - ${error.message}`, colors.red);
    results.failed++;
  }
};

// ============================================================================
// SECURITY TESTS
// ============================================================================

log('\n🔒 LEARNVERSE SECURITY TEST SUITE', colors.cyan);
log('=====================================\n', colors.cyan);

// Test 1: Check for hardcoded API keys
test('No hardcoded API keys in source code', () => {
  const apiKeyPattern = /AIzaSy[A-Za-z0-9_-]{35}/;
  const sourceFiles = [
    'supabase/functions/deepseek-ai/index.ts',
    'supabase/functions/career-guidance/index.ts',
    'supabase/functions/grade-answer/index.ts'
  ];
  
  for (const file of sourceFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (apiKeyPattern.test(content)) {
        throw new Error(`Hardcoded API key found in ${file}`);
      }
    }
  }
  return true;
});

// Test 2: Check JWT verification
test('JWT verification enabled in config', () => {
  const configFile = 'supabase/config.toml';
  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');
    if (content.includes('verify_jwt = false')) {
      throw new Error('JWT verification is disabled');
    }
  }
  return true;
});

// Test 3: Check CORS configuration
test('CORS not wide open (*)', () => {
  const edgeFunctions = [
    'supabase/functions/deepseek-ai/index.ts',
    'supabase/functions/career-guidance/index.ts',
    'supabase/functions/grade-answer/index.ts'
  ];
  
  for (const file of edgeFunctions) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes("'Access-Control-Allow-Origin': '*'")) {
        throw new Error(`Wide open CORS found in ${file}`);
      }
    }
  }
  return true;
});

// Test 4: Check for security utilities
test('Security utilities exist', () => {
  const securityFiles = [
    'src/lib/security.ts',
    'src/middleware/security.ts',
    'src/config/security.ts'
  ];
  
  for (const file of securityFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Security file missing: ${file}`);
    }
  }
  return true;
});

// Test 5: Check input validation schemas
test('Input validation schemas defined', () => {
  const securityFile = 'src/lib/security.ts';
  if (fs.existsSync(securityFile)) {
    const content = fs.readFileSync(securityFile, 'utf8');
    const schemas = ['UserInputSchema', 'SubjectInputSchema', 'CourseInputSchema', 'AIQuerySchema'];
    
    for (const schema of schemas) {
      if (!content.includes(schema)) {
        throw new Error(`Schema missing: ${schema}`);
      }
    }
  }
  return true;
});

// Test 6: Check for XSS protection
test('XSS protection implemented', () => {
  const securityFile = 'src/lib/security.ts';
  if (fs.existsSync(securityFile)) {
    const content = fs.readFileSync(securityFile, 'utf8');
    if (!content.includes('sanitizeHtml') || !content.includes('containsMaliciousContent')) {
      throw new Error('XSS protection functions missing');
    }
  }
  return true;
});

// Test 7: Check for SQL injection protection
test('SQL injection protection implemented', () => {
  const middlewareFile = 'src/middleware/security.ts';
  if (fs.existsSync(middlewareFile)) {
    const content = fs.readFileSync(middlewareFile, 'utf8');
    if (!content.includes('sqlInjectionProtection')) {
      throw new Error('SQL injection protection middleware missing');
    }
  }
  return true;
});

// Test 8: Check for rate limiting
test('Rate limiting implemented', () => {
  const securityFile = 'src/lib/security.ts';
  const middlewareFile = 'src/middleware/security.ts';
  
  let hasRateLimit = false;
  
  if (fs.existsSync(securityFile)) {
    const content = fs.readFileSync(securityFile, 'utf8');
    if (content.includes('createRateLimiter')) {
      hasRateLimit = true;
    }
  }
  
  if (fs.existsSync(middlewareFile)) {
    const content = fs.readFileSync(middlewareFile, 'utf8');
    if (content.includes('rateLimit')) {
      hasRateLimit = true;
    }
  }
  
  if (!hasRateLimit) {
    throw new Error('Rate limiting not implemented');
  }
  
  return true;
});

// Test 9: Check for CSRF protection
test('CSRF protection implemented', () => {
  const securityFile = 'src/lib/security.ts';
  if (fs.existsSync(securityFile)) {
    const content = fs.readFileSync(securityFile, 'utf8');
    if (!content.includes('generateCSRFToken') || !content.includes('validateCSRFToken')) {
      throw new Error('CSRF protection functions missing');
    }
  }
  return true;
});

// Test 10: Check for password security
test('Password security implemented', () => {
  const securityFile = 'src/lib/security.ts';
  if (fs.existsSync(securityFile)) {
    const content = fs.readFileSync(securityFile, 'utf8');
    if (!content.includes('checkPasswordStrength')) {
      throw new Error('Password security functions missing');
    }
  }
  return true;
});

// Test 11: Check for security headers
test('Security headers defined', () => {
  const securityFile = 'src/lib/security.ts';
  if (fs.existsSync(securityFile)) {
    const content = fs.readFileSync(securityFile, 'utf8');
    if (!content.includes('getSecurityHeaders')) {
      throw new Error('Security headers function missing');
    }
  }
  return true;
});

// Test 12: Check for file upload security
test('File upload security implemented', () => {
  const middlewareFile = 'src/middleware/security.ts';
  if (fs.existsSync(middlewareFile)) {
    const content = fs.readFileSync(middlewareFile, 'utf8');
    if (!content.includes('fileUploadSecurity')) {
      throw new Error('File upload security middleware missing');
    }
  }
  return true;
});

// Test 13: Check for role verification
test('Role verification not bypassed by email', () => {
  const roleFile = 'src/hooks/use-user-role.tsx';
  if (fs.existsSync(roleFile)) {
    const content = fs.readFileSync(roleFile, 'utf8');
    if (content.includes('admin@sparkacademy.edu')) {
      return 'warning'; // Warning: Email-based admin check still exists
    }
  }
  return true;
});

// Test 14: Check for environment variables
test('Environment variables configured', () => {
  const envFile = '.env.local';
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    if (!content.includes('GEMINI_API_KEY=') || !content.includes('ALLOWED_ORIGINS=')) {
      return 'warning'; // Warning: Some environment variables may be missing
    }
  } else {
    return 'warning'; // Warning: .env.local file not found
  }
  return true;
});

// Test 15: Check for security documentation
test('Security documentation exists', () => {
  const securityDoc = 'SECURITY_AUDIT_REPORT.md';
  if (!fs.existsSync(securityDoc)) {
    throw new Error('Security audit report missing');
  }
  return true;
});

// ============================================================================
// SUMMARY
// ============================================================================

log('\n📊 SECURITY TEST RESULTS', colors.cyan);
log('========================\n', colors.cyan);

log(`Total Tests: ${results.total}`, colors.white);
log(`✅ Passed: ${results.passed}`, colors.green);
log(`❌ Failed: ${results.failed}`, colors.red);
log(`⚠️  Warnings: ${results.warnings}`, colors.yellow);

const score = Math.round((results.passed / results.total) * 100);
log(`\n🏆 Security Score: ${score}/100`, score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red);

if (results.failed > 0) {
  log('\n🚨 CRITICAL SECURITY ISSUES FOUND!', colors.red);
  log('Please fix all failed tests before deploying to production.', colors.red);
} else if (results.warnings > 0) {
  log('\n⚠️  SECURITY WARNINGS FOUND', colors.yellow);
  log('Consider addressing warnings for better security.', colors.yellow);
} else {
  log('\n🎉 ALL SECURITY TESTS PASSED!', colors.green);
  log('Your application meets the security requirements.', colors.green);
}

log('\n🔒 Security testing completed.\n', colors.cyan);

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
