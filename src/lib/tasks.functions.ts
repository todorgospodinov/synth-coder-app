import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type TaskSummary = { id: string; title: string; statement: string; created_at: string; language: string };
export type Task = TaskSummary & { code: string };

/** Public read-only client (RLS: published tasks only). Created per request. */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Lists published tasks, newest first; optional keyword search in title/statement. */
export const listTasks = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ q: z.string().max(100), limit: z.number().int().min(1).max(100), language: z.enum(["python", "java", "sql"]).optional() }).parse(d))
  .handler(async ({ data }): Promise<TaskSummary[]> => {
    let query = publicClient()
      .from("tasks")
      .select("id, title, statement, created_at, language")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.language) query = query.eq("language", data.language);
    const q = data.q.trim().replace(/[%,()*\\]/g, " ");
    if (q) query = query.or(`title.ilike.%${q}%,statement.ilike.%${q}%`);
    const { data: rows, error } = await query;
    if (error) throw new Error("Could not load tasks.");
    return rows;
  });

/** One published task by id, or null. */
export const getTask = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<Task | null> => {
    const { data: row, error } = await publicClient()
      .from("tasks")
      .select("id, title, statement, code, created_at, language")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error("Could not load the task.");
    return row;
  });
