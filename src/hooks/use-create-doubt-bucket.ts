
import { supabase } from '@/integrations/supabase/client';

export async function createDoubtBucket() {
  const { data, error } = await supabase
    .storage
    .createBucket('doubt-attachments', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/*',
        'audio/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/*'
      ]
    });

  if (error) {
    console.error('Error creating doubt attachments bucket:', error);
    return false;
  }

  return true;
}
