import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Payload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  target: string; // 'all' | 'role:student' | 'role:teacher' | `user:${uuid}`
};

async function sendFcmMessage(token: string, payload: Payload) {
  const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY");
  if (!FCM_SERVER_KEY) throw new Error("Missing FCM_SERVER_KEY env var");

  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify({
      to: token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {},
      priority: "high",
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
  return json;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '').trim();
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders });
    }

    const payload = (await req.json()) as Payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: `Bearer ${jwt}` } }
    });

    // Authorization: must be admin
    const { data: roleRow, error: roleErr } = await supabase
      .from('user_roles')
      .select('role')
      .single();
    if (roleErr || roleRow?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    // Select target tokens
    let tokens: string[] = [];
    if (payload.target === "all") {
      const { data, error } = await supabase
        .from("notification_devices")
        .select("token")
        .eq("enabled", true);
      if (error) throw error;
      tokens = data.map((d: any) => d.token);
    } else if (payload.target.startsWith("role:")) {
      const role = payload.target.split(":")[1];
      const { data, error } = await supabase
        .from("notification_devices")
        .select("token")
        .eq("enabled", true)
        .in(
          "user_id",
          (await supabase.from("user_roles").select("user_id").eq("role", role)).data?.map((r: any) => r.user_id) || []
        );
      if (error) throw error;
      tokens = data.map((d: any) => d.token);
    } else if (payload.target.startsWith("user:")) {
      const userId = payload.target.split(":")[1];
      const { data, error } = await supabase
        .from("notification_devices")
        .select("token")
        .eq("enabled", true)
        .eq("user_id", userId);
      if (error) throw error;
      tokens = data.map((d: any) => d.token);
    }

    let success = 0;
    const sentLogs: { token: string; status: string; error?: string }[] = [];
    for (const token of tokens) {
      try {
        await sendFcmMessage(token, payload);
        success++;
        sentLogs.push({ token, status: 'sent' });
      } catch (_) {
        sentLogs.push({ token, status: 'failed', error: String(_) });
      }
    }

    // write logs
    if (sentLogs.length > 0) {
      await supabase.from('notification_logs').insert(
        sentLogs.map(l => ({ token: l.token, status: l.status, error: l.error }))
      );
    }

    return new Response(
      JSON.stringify({ sent: success, total: tokens.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


