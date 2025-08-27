
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get request body
    const { sessionId, userId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create Supabase client using env variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract auth token from request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', access: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('live_sessions')
      .select('*, batches:batch_id (*)')
      .eq('id', sessionId)
      .single();
      
    if (sessionError || !sessionData) {
      console.log('Session error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Session not found', access: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Check if user is admin or instructor (can always access)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (rolesError) {
      console.log('Error fetching roles:', rolesError);
    }
    
    const roles = userRoles?.map(r => r.role) || [];
    
    if (roles.includes('admin') || roles.includes('instructor')) {
      return new Response(
        JSON.stringify({ 
          access: true, 
          isAdmin: roles.includes('admin'),
          isInstructor: roles.includes('instructor')
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For students, check batch enrollment and access level
    const { data: userBatch, error: batchError } = await supabase
      .from('user_batches')
      .select('*')
      .eq('user_id', userId)
      .eq('batch_id', sessionData.batch_id)
      .maybeSingle();
      
    if (batchError) {
      console.log('Batch access error:', batchError);
    }
    
    // No batch enrollment found
    if (!userBatch) {
      return new Response(
        JSON.stringify({ 
          error: 'Not enrolled in this batch', 
          access: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check access level
    let hasAccess = false;
    
    switch (sessionData.access_level) {
      case 'free':
        // Free content is available to all enrolled users
        hasAccess = true;
        break;
      case 'paid':
        // Paid content requires purchase or subscription
        hasAccess = userBatch.has_purchased || userBatch.has_subscription;
        break;
      case 'subscription':
        // Subscription content requires active subscription
        hasAccess = userBatch.has_subscription;
        break;
      default:
        hasAccess = false;
    }
    
    return new Response(
      JSON.stringify({
        access: hasAccess,
        accessLevel: sessionData.access_level,
        isEnrolled: true,
        hasPurchased: userBatch.has_purchased,
        hasSubscription: userBatch.has_subscription
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
