// Simple script to update college_content bucket size limit
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wdmzylggisbudnddcpfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbXp5bGdnaXNidWRuZGRjcGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3Nzg2OTYsImV4cCI6MjA1OTM1NDY5Nn0.IBw-F_-mAZIuhClAB6RtFp34czJcAQWOXXfhZj0RMzE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function updateCollegeContentBucketSizeLimit() {
  try {
    console.log('Attempting to update college_content bucket size limit...');
    
    const { error } = await supabase.storage.updateBucket('college_content', {
      fileSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
    });
    
    if (error) {
      console.error('Error updating college_content bucket size limit:', error);
      return false;
    }
    
    console.log('Successfully updated college_content bucket size limit to 2GB');
    return true;
  } catch (error) {
    console.error('Error updating college_content bucket size limit:', error);
    return false;
  }
}

// Run the function
updateCollegeContentBucketSizeLimit()
  .then(success => {
    if (success) {
      console.log('✅ Bucket size limit updated successfully!');
    } else {
      console.log('❌ Failed to update bucket size limit');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 