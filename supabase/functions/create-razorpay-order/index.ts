
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
<<<<<<< HEAD
    const { courseId, amount } = await req.json()
=======
    const { itemType, itemId, amount } = await req.json()

    if (!itemType || !itemId || !amount) {
      throw new Error('Missing required parameters')
    }
>>>>>>> main

    // Create Razorpay order
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(Deno.env.get('RAZORPAY_KEY_ID') + ':' + Deno.env.get('RAZORPAY_KEY_SECRET')),
      },
      body: JSON.stringify({
<<<<<<< HEAD
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `course_${courseId}`,
      }),
    })

=======
        amount: amount, // Amount already in paise
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

>>>>>>> main
    const order = await response.json()

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
<<<<<<< HEAD
=======
    console.error('Error in create-razorpay-order:', error)
>>>>>>> main
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
