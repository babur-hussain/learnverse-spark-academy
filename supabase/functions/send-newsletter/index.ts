
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  campaignId: string;
  subject: string;
  content: string;
  recipients: Array<{ id: string; email: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, subject, content, recipients }: NewsletterRequest = await req.json();

    console.log(`Sending newsletter campaign ${campaignId} to ${recipients.length} recipients`);

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
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
                        <a href="${Deno.env.get('SITE_URL')}/unsubscribe?email=${encodeURIComponent(recipient.email)}" style="color: #64748b;">Unsubscribe</a>
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
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
