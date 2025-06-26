
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createHash } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      itemType,
      itemId 
    } = await req.json()

    // Verify signature
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    const body = razorpay_order_id + "|" + razorpay_payment_id
    
    const expectedSignature = new TextEncoder().encode(keySecret)
    const bodyToSign = new TextEncoder().encode(body)
    
    const key = await crypto.subtle.importKey(
      "raw",
      expectedSignature,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    
    const signature = await crypto.subtle.sign("HMAC", key, bodyToSign)
    const signatureArray = Array.from(new Uint8Array(signature))
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    if (signatureHex !== razorpay_signature) {
      throw new Error('Invalid payment signature')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Record the purchase
    if (itemType === 'course') {
      const { error: purchaseError } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: itemId,
          payment_id: razorpay_payment_id,
          payment_amount: 0, // Will be updated with actual amount
          status: 'active'
        })

      if (purchaseError) {
        console.error('Error recording course purchase:', purchaseError)
        throw new Error('Failed to record course purchase')
      }
    } else if (itemType === 'note') {
      // For notes, you might want to create a user_notes table or similar
      // For now, we'll just log it
      console.log(`Note purchase recorded for user ${user.id}, note ${itemId}`)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified and purchase recorded' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
