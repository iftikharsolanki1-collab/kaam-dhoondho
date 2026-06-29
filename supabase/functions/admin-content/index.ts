import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_KEY = "786313786";

type Target = "posts" | "app_ads" | "govt_schemes" | "notifications" | "trending_items";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.headers.get("x-admin-key") !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    const target = body.target as Target;
    const payload = body.payload ?? {};

    let result;
    switch (target) {
      case "posts": {
        // need a user_id; use first admin-ish user or provided
        const userId = payload.user_id;
        if (!userId) throw new Error("user_id required for posts");
        result = await supabase.from("posts").insert({
          user_id: userId,
          title: payload.title,
          description: payload.description ?? null,
          type: payload.type ?? "job",
          is_urgent: !!payload.is_urgent,
        });
        break;
      }
      case "app_ads": {
        result = await supabase.from("app_ads").insert({
          title: payload.title,
          image_url: payload.image_url || "https://placehold.co/600x200",
          link_url: payload.link_url || null,
          is_active: true,
        });
        break;
      }
      case "govt_schemes": {
        result = await supabase.from("govt_schemes").insert({
          title: payload.title,
          description: payload.description ?? null,
          link: payload.link ?? null,
          category: payload.category ?? null,
          is_active: true,
        });
        break;
      }
      case "notifications": {
        // broadcast to all users
        const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
        if (usersErr) throw usersErr;
        const rows = (users?.users ?? []).map((u: any) => ({
          user_id: u.id,
          title: payload.title,
          message: payload.message || payload.title,
          type: "general",
        }));
        if (rows.length === 0) {
          result = { error: null };
        } else {
          result = await supabase.from("notifications").insert(rows);
        }
        break;
      }
      case "trending_items": {
        result = await supabase.from("trending_items").insert({
          title: payload.title,
          description: payload.description ?? null,
          image_url: payload.image_url || "https://placehold.co/600x400",
          prompt: payload.prompt || payload.title,
          category: payload.category || "Corporate",
          is_new: !!payload.is_new,
          is_active: true,
        });
        break;
      }
      default:
        throw new Error("Unknown target: " + target);
    }

    if ((result as any).error) throw (result as any).error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-content error:", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
