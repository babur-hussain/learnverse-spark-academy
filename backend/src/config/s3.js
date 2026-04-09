const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION || 'ap-south-1',
});

const BUCKET_NAME = process.env.S3_BUCKET || 'learnverse-uploads';

/**
 * Generate a pre-signed URL for uploading a file to S3
 */
const getPresignedUploadUrl = async (fileName, fileType, folder = 'uploads') => {
  const key = `${folder}/${uuidv4()}-${fileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 300, // 5 minutes
  };

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.S3_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
};

/**
 * Delete a file from S3
 */
const deleteFile = async (key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

/**
 * Generate a pre-signed URL for downloading/viewing a file from S3
 */
const getPresignedDownloadUrl = (s3Url) => {
  // Extract the bucket and key from the full S3 URL
  // Format: https://<bucket>.s3.<region>.amazonaws.com/<key>
  const urlObj = new URL(s3Url);
  const hostParts = urlObj.hostname.split('.');
  const bucket = hostParts[0]; // e.g. 'learnverse'
  const key = decodeURIComponent(urlObj.pathname.slice(1)); // remove leading /

  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 3600, // 1 hour
  };

  return s3.getSignedUrl('getObject', params);
};

module.exports = { s3, getPresignedUploadUrl, getPresignedDownloadUrl, deleteFile, BUCKET_NAME };
