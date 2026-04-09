#!/usr/bin/env python3
"""
Transforms remaining apiClient.upload() storage patterns into S3 upload helpers.
Replaces:
  apiClient.upload(path, file, opts) 
  -> uploadFileToS3(file, folder)
  
  apiClient.getPublicUrl(path)
  -> getFileUrl(path)
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')


def find_files_with_upload(src_dir):
    result = []
    for dirpath, _, filenames in os.walk(src_dir):
        for f in filenames:
            if f.endswith(('.ts', '.tsx')):
                filepath = os.path.join(dirpath, f)
                with open(filepath, 'r') as fh:
                    content = fh.read()
                if '.upload(' in content and 'apiClient' in content:
                    result.append(filepath)
    return result


def transform_uploads(content):
    original = content
    
    # Add the S3 upload import if not present
    if 'uploadFileToS3' not in content and '.upload(' in content:
        # Find the apiClient import line
        import_match = re.search(r"import apiClient from '@/integrations/api/client';", content)
        if import_match:
            content = content[:import_match.end()] + \
                "\nimport { uploadFileToS3 } from '@/integrations/s3/upload';" + \
                content[import_match.end():]
    
    # Pattern: apiClient /* S3: bucket */ .upload(path, file, options)
    # Replace entire chain: apiClient /* ... */.upload(filePath, file, { ... })
    # with: await uploadFileToS3(file, 'bucket')
    
    # Handle multi-line patterns like:
    # apiClient /* S3: learn-verse-audio */
    #   .upload(filePath, audio.file, { ... });
    def upload_replacer(m):
        path = m.group(1).strip()
        file_arg = m.group(2).strip()
        folder = path.split('/')[0] if '/' in path else "'uploads'"
        return f"uploadFileToS3({file_arg}, {folder})"
    
    content = re.sub(
        r"apiClient\s*/\*[^*]+\*/\s*\n?\s*\.upload\(([^,]+),\s*([^,)]+)(?:,\s*\{[^}]*\})?\)",
        upload_replacer,
        content
    )
    
    # Handle simpler patterns: apiClient /* courses */.upload(filePath, file, { upsert: true })
    content = re.sub(
        r"apiClient\s*/\*\s*(\w+)\s*\*/\.upload\(([^,]+),\s*([^,)]+)(?:,\s*\{[^}]*\})?\)",
        lambda m: f"uploadFileToS3({m.group(3).strip()}, {m.group(2).strip()})",
        content
    )
    
    # Handle storage pattern chains with .getPublicUrl
    content = re.sub(
        r"apiClient\s*/\*[^*]+\*/\s*\n?\s*\.getPublicUrl\(([^)]+)\)",
        lambda m: f"{{ data: {{ publicUrl: `${{import.meta.env.VITE_API_BASE_URL}}/api/storage/public/${{" + m.group(1).strip() + "}}` }} }}",
        content
    )
    
    # Handle remaining bare .upload patterns 
    content = re.sub(
        r"\.upload\(([^,]+),\s*([^,)]+)(?:,\s*\{[^}]*\})?\)",
        lambda m: f"/* S3 upload */ uploadFileToS3({m.group(2).strip()}, {m.group(1).strip()})",
        content
    )
    
    # Fix error destructuring patterns from { error: uploadError, data } to try/catch
    # These no longer make sense with axios (which throws on error)
    
    # Handle getPublicUrl chains that were left
    content = re.sub(
        r"\.getPublicUrl\(([^)]+)\)",
        lambda m: f" /* TODO: use S3 URL for {m.group(1).strip()} */",
        content
    )
    
    return content


def main():
    files = find_files_with_upload(SRC)
    print(f"Found {len(files)} files with .upload() patterns")
    
    transformed = 0
    for filepath in files:
        with open(filepath, 'r') as f:
            original = f.read()
        
        result = transform_uploads(original)
        
        if result != original:
            with open(filepath, 'w') as f:
                f.write(result)
            relpath = os.path.relpath(filepath, ROOT)
            print(f"  ✅ {relpath}")
            transformed += 1
    
    print(f"\nTransformed {transformed} / {len(files)} files")


if __name__ == '__main__':
    main()
