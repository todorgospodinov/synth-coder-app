import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

function url() {
  const u = process.env["SUPABASE_URL"];
  if (!u) throw new Error("Backend is not configured.");
  return u;
}
function key() {
  const k = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!k) throw new Error("Backend is not configured.");
  return k;
}

/** Caller-scoped client: RLS applies as the signed-in OAuth user. */
export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("supabaseForUser requires a verified OAuth token");
  const k = key();
  return createClient<Database>(url(), k, {
    global: {
      headers: { Authorization: `Bearer ${token}`, apikey: k },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
