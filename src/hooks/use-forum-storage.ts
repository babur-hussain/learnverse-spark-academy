
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useForumStorage() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function createBucketIfNeeded() {
      setIsLoading(true);
      try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase
          .storage
          .listBuckets();

        if (listError) {
          throw new Error(`Error checking for forum-attachments bucket: ${listError.message}`);
        }

        const bucketExists = buckets?.some(bucket => bucket.name === 'forum-attachments');

        if (!bucketExists) {
          // Create bucket
          const { error: createError } = await supabase
            .storage
            .createBucket('forum-attachments', {
              public: false,
              fileSizeLimit: 10485760, // 10MB
              allowedMimeTypes: [
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
              ]
            });

          if (createError) {
            throw new Error(`Error creating forum-attachments bucket: ${createError.message}`);
          }

          // Set bucket to public
          const { error: updateError } = await supabase
            .storage
            .updateBucket('forum-attachments', {
              public: true
            });

          if (updateError) {
            throw new Error(`Error setting forum-attachments bucket to public: ${updateError.message}`);
          }
        }

        setIsReady(true);
      } catch (err) {
        console.error('Error setting up forum storage:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    createBucketIfNeeded();
  }, []);

  return { isReady, isLoading, error };
}
