#!/usr/bin/env python3
"""Fixes remaining broken storage .from(bucket) patterns by finding and replacing
the entire broken chain with a clean uploadFileToS3 or S3 URL pattern."""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

def find_files(src_dir):
    result = []
    for dirpath, _, filenames in os.walk(src_dir):
        for f in filenames:
            if f.endswith(('.ts', '.tsx')):
                filepath = os.path.join(dirpath, f)
                with open(filepath, 'r') as fh:
                    content = fh.read()
                if ".from(" in content and ("Array.from" not in content or ".from('" in content or ".from(bucket" in content):
                    if ".from('" in content or ".from(bucket" in content:
                        result.append(filepath)
    return result

def fix_storage_patterns(content):
    original = content
    
    # Ensure S3 upload import exists
    if "uploadFileToS3" not in content and (".from('" in content or ".from(bucket" in content):
        import_match = re.search(r"import apiClient from '@/integrations/api/client';", content)
        if import_match:
            content = content[:import_match.end()] + \
                "\nimport { uploadFileToS3 } from '@/integrations/s3/upload';" + \
                content[import_match.end():]
    
    # Pattern 1: Multi-line broken upload chains
    # const { error: uploadError, data } = await apiClient 
    #   .from(bucketName)
    #   /* S3 upload */ uploadFileToS3(file, path);
    content = re.sub(
        r"const\s*\{\s*error:\s*\w+,?\s*data?\s*\}\s*=\s*await\s*apiClient\s*\n\s*\.from\([^)]+\)\s*\n\s*/\* S3 upload \*/ uploadFileToS3\(([^,]+),\s*([^)]+)\);",
        lambda m: f"const publicUrl = await uploadFileToS3({m.group(1).strip()}, {m.group(2).strip()});",
        content
    )
    
    # Pattern 2: Get public URL chains
    # const { data: { publicUrl } } = apiClient 
    #   .from(bucketName)
    #   /* TODO: use S3 URL for path */;
    content = re.sub(
        r"const\s*\{\s*data:\s*\{\s*publicUrl\s*\}\s*\}\s*=\s*apiClient\s*\n\s*\.from\([^)]+\)\s*\n?\s*/\*[^*]+\*/;",
        "// Public URL is returned from uploadFileToS3 above",
        content
    )
    
    # Pattern 3: Simple .from('bucket-name') chains
    # apiClient
    #   .from('bucket-name')
    #   /* S3 upload */ uploadFileToS3(...)
    content = re.sub(
        r"apiClient\s*\n\s*\.from\([^)]+\)\s*\n\s*/\* S3 upload \*/ uploadFileToS3\(([^)]+)\)",
        lambda m: f"await uploadFileToS3({m.group(1).strip()})",
        content
    )
    
    # Pattern 4: Remaining .from('bucket') chains with getPublicUrl
    content = re.sub(
        r"apiClient\s*\n\s*\.from\([^)]+\)\s*\n?\s*/\*[^*]+\*/;?",
        "// S3 URL managed by backend",
        content
    )
    
    # Pattern 5: Direct .from('bucket') on same line
    content = re.sub(
        r"apiClient\s*\.from\('([^']+)'\)\s*/\* S3 upload \*/ uploadFileToS3\(([^)]+)\)",
        lambda m: f"await uploadFileToS3({m.group(2).strip()})",
        content
    )
    
    # Pattern 6: Remaining bare .from('bucket') or .from(var)
    content = re.sub(
        r"apiClient\s*\n?\s*\.from\(([^)]+)\)",
        lambda m: f"apiClient /* bucket: {m.group(1).strip()} */",
        content
    )
    
    # Clean up double-awaits
    content = content.replace("await await ", "await ")
    
    return content

def main():
    files = find_files(SRC)
    print(f"Found {len(files)} files with storage .from() patterns")
    
    transformed = 0
    for filepath in files:
        with open(filepath, 'r') as f:
            orig = f.read()
        
        result = fix_storage_patterns(orig)
        
        if result != orig:
            with open(filepath, 'w') as f:
                f.write(result)
            print(f"  ✅ {os.path.relpath(filepath, ROOT)}")
            transformed += 1
    
    print(f"\nTransformed {transformed} / {len(files)} files")

if __name__ == '__main__':
    main()
