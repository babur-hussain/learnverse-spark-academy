
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Restrictive CORS: reflect allowed origins only
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

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
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
    const store = (globalThis as unknown as { ratesRzp?: Map<string, { count: number; reset: number }> })
    if (!store.ratesRzp) store.ratesRzp = new Map()
    const rec = store.ratesRzp.get(ip) || { count: 0, reset: now + windowMs }
    if (now > rec.reset) { rec.count = 0; rec.reset = now + windowMs }
    rec.count += 1
    store.ratesRzp.set(ip, rec)
    if (rec.count > maxReq) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: buildCorsHeaders(origin) })
    }

    const { itemType, itemId } = await req.json()

    if (!itemType || !itemId) {
      throw new Error('Missing required parameters')
    }

    // Server-derive the price to prevent client tampering
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const srv = createClient(supabaseUrl, supabaseKey)

    let priceInPaise = 0
    if (itemType === 'course') {
      const { data, error } = await srv
        .from('courses')
        .select('price, currency')
        .eq('id', itemId)
        .single()
      if (error || !data) throw new Error('Course not found')
      const price = Number(data.price || 0)
      if (!isFinite(price) || price <= 0) throw new Error('Invalid price')
      priceInPaise = Math.round(price * 100)
    } else if (itemType === 'note') {
      // If notes payable, look up from your notes table; otherwise block
      throw new Error('Purchases for notes are not enabled')
    } else {
      throw new Error('Unsupported item type')
    }

    // Create Razorpay order
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(Deno.env.get('RAZORPAY_KEY_ID') + ':' + Deno.env.get('RAZORPAY_KEY_SECRET')),
      },
      body: JSON.stringify({
        amount: priceInPaise, // Derived on server
        currency: 'INR',
        receipt: `${itemType}_${itemId}_${Date.now()}`,
        notes: {
          item_type: itemType,
          item_id: itemId
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Razorpay API Error:', errorData)
      throw new Error('Failed to create Razorpay order')
    }

    const order = await response.json()

    return new Response(JSON.stringify(order), {
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in create-razorpay-order:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...buildCorsHeaders(origin), 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
