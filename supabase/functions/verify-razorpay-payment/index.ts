
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createHash } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)
const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { ...baseHeaders }
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(origin) })
  }

  try {
    // Basic per-IP rate limit
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const windowMs = 60_000
    const maxReq = 10
    const store = (globalThis as unknown as { ratesRzpVerify?: Map<string, { count: number; reset: number }> })
    if (!store.ratesRzpVerify) store.ratesRzpVerify = new Map()
    const rec = store.ratesRzpVerify.get(ip) || { count: 0, reset: now + windowMs }
    if (now > rec.reset) { rec.count = 0; rec.reset = now + windowMs }
    rec.count += 1
    store.ratesRzpVerify.set(ip, rec)
    if (rec.count > maxReq) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: buildCorsHeaders(origin) })
    }

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

    // Fetch payment from Razorpay to verify amount/currency/status
    const rzKeyId = Deno.env.get('RAZORPAY_KEY_ID')!
    const rzKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: {
        'Authorization': 'Basic ' + btoa(rzKeyId + ':' + rzKeySecret)
      }
    })
    if (!payRes.ok) {
      throw new Error('Failed to fetch payment from Razorpay')
    }
    const payment = await payRes.json()
    if (payment.status !== 'captured') {
      throw new Error('Payment not captured')
    }

    // Server-derive price and ensure it matches
    let expectedAmount = 0
    if (itemType === 'course') {
      const { data: course, error: courseErr } = await supabase
        .from('courses')
        .select('price, currency')
        .eq('id', itemId)
        .single()
      if (courseErr || !course) throw new Error('Course not found')
      const price = Number(course.price || 0)
      if (!isFinite(price) || price <= 0) throw new Error('Invalid price')
      expectedAmount = Math.round(price * 100)
    } else {
      throw new Error('Unsupported item type')
    }

    if (payment.amount !== expectedAmount || payment.currency !== 'INR') {
      throw new Error('Payment amount/currency mismatch')
    }

    // Record the purchase accurately
    if (itemType === 'course') {
      const { error: purchaseError } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: itemId,
          payment_id: razorpay_payment_id,
          payment_amount: expectedAmount / 100,
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
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
