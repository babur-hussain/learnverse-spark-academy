
import { useState } from 'react';

/**
 * Forum storage hook — S3 bucket is pre-configured on the backend.
 * This hook now simply reports readiness (always ready since S3 is managed server-side).
 */
export function useForumStorage() {
  const [isReady] = useState(true);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  return { isReady, isLoading, error };
}
