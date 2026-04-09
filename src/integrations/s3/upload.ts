// S3 Upload Helpers
// Files are uploaded via pre-signed URLs obtained from the EC2 backend
import apiClient from '@/integrations/api/client';
import axios from 'axios';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Get a pre-signed URL from the backend for uploading a file to S3.
 */
export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  folder: string = 'uploads'
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const { data } = await apiClient.post('/api/storage/presigned-url', {
    fileName,
    fileType,
    folder,
  });
  return data;
}

/**
 * Upload a file to S3 using a pre-signed URL.
 */
export async function uploadFileToS3(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const { uploadUrl, fileUrl, key } = await getPresignedUploadUrl(
    file.name,
    file.type,
    folder
  );

  // Upload directly to S3
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

  return {
    url: fileUrl,
    key,
    bucket: folder,
  };
}

/**
 * Upload a blob to S3 using a pre-signed URL.
 */
export async function uploadBlobToS3(
  blob: Blob,
  fileName: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const { uploadUrl, fileUrl, key } = await getPresignedUploadUrl(
    fileName,
    blob.type,
    folder
  );

  await axios.put(uploadUrl, blob, {
    headers: {
      'Content-Type': blob.type,
    },
  });

  return {
    url: fileUrl,
    key,
    bucket: folder,
  };
}

/**
 * Delete a file from S3 via the backend.
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  await apiClient.delete('/api/storage/file', { data: { key } });
}
