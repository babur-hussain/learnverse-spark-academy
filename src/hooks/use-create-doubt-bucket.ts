
/**
 * S3 bucket for doubt attachments is pre-configured on the backend.
 * This function is no longer needed but kept for backward compatibility.
 */
export async function createDoubtBucket() {
  // S3 bucket is managed by backend — no action needed from frontend
  return true;
}
