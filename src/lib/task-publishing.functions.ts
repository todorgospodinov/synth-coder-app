import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TaskStatus = "for_review" | "published" | "rejected";
export type OwnedTask = { id: string; title: string; statement: string; status: TaskStatus; created_at: string; author_id: string | null };

const COLS = "id, title, statement, status, created_at, author_id";

/** Signed-in user submits a task; always lands in "for_review", owned by the caller. */
export const submitTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().trim().min(3).max(150),
      statement: z.string().trim().min(10).max(8000),
      code: z.string().max(20000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tasks")
      .insert({ ...data, author_id: context.userId, status: "for_review", is_published: false })
      .select("id")
      .single();
    if (error) throw new Error("Could not submit the task.");
    return row;
  });

/** The caller's own tasks in every state. */
export const listMyTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OwnedTask[]> => {
    const { data, error } = await context.supabase
      .from("tasks").select(COLS).eq("author_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your tasks.");
    return data as OwnedTask[];
  });

function assertAdmin(claims: unknown) {
  const meta = (claims as { app_metadata?: { is_admin?: unknown } } | undefined)?.app_metadata;
  if (meta?.is_admin !== true) throw new Error("Forbidden");
}

/** Admin: all tasks with author emails. */
export const adminListTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<(OwnedTask & { author_email: string | null })[]> => {
    assertAdmin(context.claims);
    // RLS "Admins read all tasks" (JWT app_metadata.is_admin) lets the admin's own session see every row.
    const { data, error } = await context.supabase.from("tasks").select(COLS).order("created_at", { ascending: false });
    if (error) throw new Error("Could not load tasks.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emails = new Map((users?.users ?? []).map((u) => [u.id, u.email ?? null]));
    return (data as OwnedTask[]).map((t) => ({ ...t, author_email: t.author_id ? emails.get(t.author_id) ?? null : null }));
  });

/** Admin: publish or reject a task. */
export const adminSetTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["published", "rejected"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    // RLS "Admins update task status" permits this for admins using their own session.
    const { error } = await context.supabase
      .from("tasks")
      .update({ status: data.status, is_published: data.status === "published", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error("Could not update the task.");
    return { ok: true };
  });
