import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Server-only: true if any user has app_metadata.is_admin === true. */
async function anyAdminExists(): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("Could not check existing admins.");
    if (data.users.some((u) => u.app_metadata?.["is_admin"] === true)) return true;
    if (data.users.length < 1000) return false;
  }
}

/** Public: only reveals whether setup is still needed (a boolean). */
export const getAdminSetupStatus = createServerFn({ method: "GET" }).handler(async () => ({
  adminExists: await anyAdminExists(),
}));

const Input = z.object({
  fullName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

/** One-time: creates the first admin, refused once any admin exists. */
export const createFirstAdmin = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    if (await anyAdminExists()) throw new Error("An admin already exists. This setup can only run once.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
      app_metadata: { is_admin: true },
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
