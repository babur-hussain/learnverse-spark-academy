
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || '').split(',').map(s => s.trim()).filter(Boolean)
const baseHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
} as const

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { ...baseHeaders }
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

interface NewsletterRequest {
  campaignId: string;
  subject: string;
  content: string;
  recipients: Array<{ id: string; email: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const origin = req.headers.get('Origin')
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: buildCorsHeaders(origin) });
  }

  try {
    // Basic per-IP rate limit
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const windowMs = 60_000
    const maxReq = 5
    const store = (globalThis as unknown as { ratesNewsletter?: Map<string, { count: number; reset: number }> })
    if (!store.ratesNewsletter) store.ratesNewsletter = new Map()
    const rec = store.ratesNewsletter.get(ip) || { count: 0, reset: now + windowMs }
    if (now > rec.reset) { rec.count = 0; rec.reset = now + windowMs }
    rec.count += 1
    store.ratesNewsletter.set(ip, rec)
    if (rec.count > maxReq) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: buildCorsHeaders(origin) })
    }

    // Require admin JWT
    const auth = req.headers.get('Authorization')
    if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: buildCorsHeaders(origin) })

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.7.1')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { data: { user } } = await supabase.auth.getUser(auth.replace('Bearer ', ''))
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: buildCorsHeaders(origin) })
    const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
    if (roleRow?.role !== 'admin') return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: buildCorsHeaders(origin) })

    const { campaignId, subject, content, recipients }: NewsletterRequest = await req.json();

    console.log(`Sending newsletter campaign ${campaignId} to ${recipients.length} recipients`);

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const token = crypto.randomUUID()
          const emailResponse = await resend.emails.send({
            from: "LearnVerse <noreply@sparkacademy.edu>",
            to: [recipient.email],
            subject: subject,
            html: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #2563eb;">LearnVerse</h1>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                      ${content.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                      <p style="font-size: 14px; color: #64748b;">
                        You're receiving this email because you subscribed to LearnVerse newsletter.<br>
                        <a href="${Deno.env.get('SITE_URL')}/unsubscribe?token=${encodeURIComponent(token)}" style="color: #64748b;">Unsubscribe</a>
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });

          return {
            recipientId: recipient.id,
            email: recipient.email,
            success: true,
            messageId: emailResponse.data?.id
          };
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          return {
            recipientId: recipient.id,
            email: recipient.email,
            success: false,
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Campaign ${campaignId} completed: ${successCount} sent, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      campaignId,
      totalSent: successCount,
      totalFailed: failureCount,
      results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...buildCorsHeaders(origin),
      },
    });
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(origin) },
      }
    );
  }
};

serve(handler);
