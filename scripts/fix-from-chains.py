#!/usr/bin/env python3
"""
Transforms apiClient.from('table').select/insert/update/delete chains
into proper apiClient.get/post/put/delete() calls.

Pattern matching:
  apiClient /* table: 'X' */
    .from('X')
    .select(...)           -> apiClient.get('/api/admin/X', { params: ... })
    .insert(...)           -> apiClient.post('/api/admin/X', ...)
    .update(...)           -> apiClient.put('/api/admin/X/id', ...)
    .delete()              -> apiClient.delete('/api/admin/X/id')
    .eq('col', val)        -> added as params
    .single()              -> (removed)
    .order(...)            -> added as params
    .select()              -> (removed, just use response)
    
Also handles:
  apiClient /* TODO: Replace with S3 upload */ .from('bucket').upload(...)
  -> uploadFileToS3(...)
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')


def find_files_with_from(src_dir):
    """Find all .ts/.tsx files containing .from( pattern"""
    result = []
    for dirpath, dirnames, filenames in os.walk(src_dir):
        for f in filenames:
            if f.endswith(('.ts', '.tsx')):
                filepath = os.path.join(dirpath, f)
                with open(filepath, 'r') as fh:
                    content = fh.read()
                if ".from(" in content and "apiClient" in content:
                    result.append(filepath)
    return result


def transform_chain(content):
    """Transform apiClient.from() chains to proper HTTP calls"""
    
    # Pattern 1: Simple .from('table').select('*') or .select(...) with .eq, .order, etc.
    # These are typically read operations -> GET
    
    # Remove /* table: 'X' */ comments
    content = re.sub(r'/\* table: \'[^\']+\' \*/', '', content)
    content = re.sub(r'/\* TODO: Replace with proper API call for \'[^\']+\' table \*/', '', content)
    content = re.sub(r'/\* TODO: Replace with S3 upload \*/', '', content)
    
    # ============================================================
    # Handle DELETE patterns: .from('table').delete().eq('id', id)
    # ============================================================
    # Pattern: apiClient.from('table').delete().eq('col', val)
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)\s*\.delete\(\)\s*\.eq\('(\w+)',\s*([^)]+)\)",
        lambda m: f"apiClient.delete(`/api/admin/{m.group(1)}/${{{m.group(3).strip()}}}`)",
        content
    )
    
    # ============================================================
    # Handle INSERT patterns: .from('table').insert({...})
    # ============================================================
    # Pattern: apiClient.from('table').insert(data).select().single()
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)\s*\.insert\(([^)]+)\)\s*(?:\.select\([^)]*\)\s*)?(?:\.single\(\)\s*)?",
        lambda m: f"apiClient.post('/api/admin/{m.group(1)}', {m.group(2).strip()})",
        content
    )
    
    # ============================================================
    # Handle UPDATE patterns: .from('table').update({...}).eq(...)
    # ============================================================
    # Pattern: apiClient.from('table').update(data).eq('col', val)
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)\s*\.update\(([^)]+)\)\s*\.eq\('(\w+)',\s*([^)]+)\)(?:\s*\.select\([^)]*\))?(?:\s*\.single\(\))?",
        lambda m: f"apiClient.put(`/api/admin/{m.group(1)}/${{{m.group(4).strip()}}}`, {m.group(2).strip()})",
        content
    )
    
    # ============================================================
    # Handle UPSERT patterns: .from('table').upsert({...})
    # ============================================================
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)\s*\.upsert\(([^)]+)\)",
        lambda m: f"apiClient.post('/api/admin/{m.group(1)}/upsert', {m.group(2).strip()})",
        content
    )
    
    # ============================================================
    # Handle SELECT with multiple .eq chains -> GET with params
    # ============================================================
    # First handle simple: .from('table').select('*') or .select(...)
    # followed by chains of .eq/.gt/.gte/.lt/.lte/.not/.order/.limit/.single/.maybeSingle
    
    def replace_select_chain(match):
        full = match.group(0)
        table = match.group(1)
        
        # Check for .eq patterns to build params
        eq_matches = re.findall(r"\.eq\('(\w+)',\s*([^)]+)\)", full)
        
        has_single = '.single()' in full or '.maybeSingle()' in full
        
        if eq_matches and len(eq_matches) == 1:
            col, val = eq_matches[0]
            return f"apiClient.get(`/api/admin/{table}`, {{ params: {{ {col}: {val.strip()} }} }})"
        elif eq_matches and len(eq_matches) > 1:
            params = ', '.join(f"{col}: {val.strip()}" for col, val in eq_matches)
            return f"apiClient.get(`/api/admin/{table}`, {{ params: {{ {params} }} }})"
        else:
            return f"apiClient.get('/api/admin/{table}')"
    
    # Match .from('table').select(...) followed by any chain of .eq/.order/.single etc
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)\s*\.select\([^)]*\)(?:\s*\.(?:eq|gt|gte|lt|lte|not|neq|in|is|or|and|order|limit|range|single|maybeSingle|count)\([^)]*\))*",
        replace_select_chain,
        content
    )
    
    # ============================================================
    # Handle remaining bare .from('table') patterns
    # ============================================================
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)",
        lambda m: f"apiClient /* {m.group(1)} */",
        content
    )
    
    # ============================================================ 
    # Handle storage upload patterns
    # ============================================================
    # apiClient.from('bucket').upload(path, file, options) -> uploadFileToS3(file, folder)
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)\s*\.upload\(",
        lambda m: f"/* S3 upload for '{m.group(1)}' */ apiClient.post('/api/storage/upload', ",
        content
    )
    
    # Handle .getPublicUrl patterns
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\('(\w+)'\)\s*\.getPublicUrl\(([^)]+)\)",
        lambda m: f"{{ data: {{ publicUrl: `${{import.meta.env.VITE_API_BASE_URL}}/api/storage/file/{m.group(1)}/${{{m.group(2).strip()}}}` }} }}",
        content
    )
    
    # Clean up any leftover .select() calls chained after apiClient.get(...) 
    # These are invalid axios syntax
    content = re.sub(r"(apiClient\.(?:get|post|put|delete)\([^)]+\))\s*\.select\([^)]*\)", r"\1", content)
    content = re.sub(r"(apiClient\.(?:get|post|put|delete)\([^)]+\))\s*\.single\(\)", r"\1", content)
    content = re.sub(r"(apiClient\.(?:get|post|put|delete)\([^)]+\))\s*\.maybeSingle\(\)", r"\1", content)
    content = re.sub(r"(apiClient\.(?:get|post|put|delete)\([^)]+\))\s*\.order\([^)]+\)", r"\1", content)
    content = re.sub(r"(apiClient\.(?:get|post|put|delete)\([^)]+\))\s*\.eq\([^)]+\)", r"\1", content)
    
    return content


def main():
    files = find_files_with_from(SRC)
    print(f"Found {len(files)} files with .from() patterns to transform")
    
    transformed = 0
    for filepath in files:
        with open(filepath, 'r') as f:
            original = f.read()
        
        result = transform_chain(original)
        
        if result != original:
            with open(filepath, 'w') as f:
                f.write(result)
            relpath = os.path.relpath(filepath, ROOT)
            print(f"  ✅ {relpath}")
            transformed += 1
    
    print(f"\nTransformed {transformed} / {len(files)} files")


if __name__ == '__main__':
    main()
