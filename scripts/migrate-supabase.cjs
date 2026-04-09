#!/usr/bin/env node
/**
 * Transforms all files that still reference `supabase.` calls
 * to use `apiClient` instead. This handles:
 * - supabase.from('table').select/insert/update/delete → apiClient.get/post/put/delete
 * - supabase.auth.getUser() → auth.currentUser
 * - supabase.auth.getSession() → auth.currentUser
 * - supabase.storage.from(...) → S3 upload helpers
 * - supabase.functions.invoke(...) → apiClient.post(...)
 * - supabase.channel(...) → polling (remove)
 * - supabase.removeChannel(...) → (remove)
 * - supabase.rpc(...) → apiClient.post(...)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// Find all files still containing 'supabase' in src/
const files = execSync(
  `grep -rl "supabase" src/ --include="*.ts" --include="*.tsx"`,
  { cwd: ROOT, encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

console.log(`Found ${files.length} files to transform`);

for (const relFile of files) {
  const filePath = path.join(ROOT, relFile);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Ensure apiClient import exists (some files might not have it if they only had supabase in comments)
  if (content.includes('supabase.') && !content.includes("import apiClient from '@/integrations/api/client'")) {
    // Add import at the top after existing imports
    const importLine = "import apiClient from '@/integrations/api/client';\n";
    // Insert after last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfImportLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfImportLine + 1) + importLine + content.slice(endOfImportLine + 1);
    } else {
      content = importLine + content;
    }
  }

  // Add auth import if file uses supabase.auth
  if (content.includes('supabase.auth') && !content.includes("from '@/integrations/firebase/config'")) {
    const importLine = "import { auth } from '@/integrations/firebase/config';\n";
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfImportLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfImportLine + 1) + importLine + content.slice(endOfImportLine + 1);
    }
  }

  // Replace supabase.auth.getUser() pattern
  content = content.replace(
    /const\s*\{\s*data:\s*\{\s*user\s*\}\s*\}\s*=\s*await\s*supabase\.auth\.getUser\(\);?/g,
    'const user = auth.currentUser;'
  );

  // Replace supabase.auth.getSession() patterns
  content = content.replace(
    /const\s*\{\s*data\s*\}\s*=\s*await\s*supabase\.auth\.getSession\(\);?/g,
    'const currentUser = auth.currentUser;'
  );
  content = content.replace(/data\.session\?\.user\.id/g, 'currentUser?.uid');
  content = content.replace(/data\.session\?\.user/g, 'currentUser');

  // Replace supabase.auth.getUser() → auth.currentUser
  content = content.replace(
    /const\s+userResponse\s*=\s*await\s*supabase\.auth\.getUser\(\);?/g,
    'const userResponse = { data: { user: auth.currentUser } };'
  );

  // Keep the remaining patterns intact by just commenting them out with a TODO
  // For complex supabase.from(...) chains, we wrap them in apiClient calls

  // Replace supabase.functions.invoke('name', { body: ... }) → apiClient.post('/api/name', ...)
  content = content.replace(
    /await\s+supabase\.functions\.invoke\(\s*'([^']+)'\s*,\s*\{\s*body:\s*(\{[^}]*\}|\w+)\s*\}\s*\)/g,
    (match, funcName, body) => {
      const apiPath = funcName.replace(/-/g, '/');
      return `await apiClient.post('/api/${apiPath}', ${body})`;
    }
  );

  // More complex functions.invoke patterns (multiline)
  content = content.replace(
    /supabase\.functions\.invoke\(/g,
    'apiClient.post( /* TODO: Update function path */ '
  );

  // Replace supabase.storage patterns with S3 upload helper comments
  content = content.replace(
    /supabase\.storage\s*\.\s*from\s*\(\s*'([^']+)'\s*\)/g,
    `/* TODO: Use S3 upload helper for '$1' bucket */ apiClient`
  );

  // Replace supabase.rpc('name', ...) → apiClient.post('/api/rpc/name', ...)
  content = content.replace(
    /supabase\.rpc\(\s*'([^']+)'\s*,?\s*/g,
    (match, rpcName) => `apiClient.post('/api/rpc/${rpcName}', `
  );

  // Replace supabase.channel(...) and supabase.removeChannel(...)
  content = content.replace(/supabase\s*\.\s*channel\s*\(/g, '/* Realtime removed - use polling */ ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) } /* was supabase.channel(');
  content = content.replace(/supabase\s*\.\s*removeChannel\s*\(/g, '/* Realtime channel cleanup removed */ ((_: any) => {} /* was supabase.removeChannel(');

  // Replace simple supabase.from('table') patterns → apiClient equivalent
  // This covers: supabase.from('table').select/insert/update/delete
  content = content.replace(
    /supabase\s*\n?\s*\.from\(\s*'([^']+)'\s*\)/g,
    (match, tableName) => `apiClient /* TODO: Replace with proper API call for '${tableName}' table */\n        .from('${tableName}')`
  );

  // Clean up remaining bare supabase references that are just method calls
  content = content.replace(
    /await supabase\s*\n/g,
    'await apiClient /* TODO: migrate this Supabase call */\n'
  );

  // Replace the Database type import if present
  content = content.replace(
    /import\s+type\s*\{\s*Database\s*\}\s*from\s*'@\/integrations\/supabase\/types';?\n?/g,
    ''
  );
  content = content.replace(
    /import\s*\{\s*Database\s*\}\s*from\s*'@\/integrations\/supabase\/types';?\n?/g,
    ''
  );

  // Remove @supabase/supabase-js imports
  content = content.replace(
    /import\s*\{[^}]*\}\s*from\s*'@supabase\/supabase-js';?\n?/g,
    ''
  );

  // Remove Session import from supabase
  content = content.replace(
    /import\s*\{\s*Session\s*\}\s*from\s*'@supabase\/supabase-js';?\n?/g,
    ''
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Transformed: ${relFile}`);
  } else {
    console.log(`  ⏭️  No changes: ${relFile}`);
  }
}

console.log('\nDone! Please review TODO comments in transformed files.');
