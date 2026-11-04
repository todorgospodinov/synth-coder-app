import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_tasks",
  title: "Search published tasks",
  description: "List published programming tasks, newest first, optionally filtered by keyword and language.",
  inputSchema: {
    query: z.string().max(100).optional().describe("Keyword to match in title or statement."),
    language: z.enum(["python", "java", "sql"]).optional().describe("Only tasks for this language."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, language, limit }, ctx) => {
    let q = supabaseForUser(ctx)
      .from("tasks")
      .select("id, title, statement, language, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (language) q = q.eq("language", language);
    const term = (query ?? "").trim().replace(/[%,()*\\]/g, " ");
    if (term) q = q.or(`title.ilike.%${term}%,statement.ilike.%${term}%`);
    const { data, error } = await q;
    if (error) throw new ToolError("Could not load tasks.");
    const tasks = data.map((t) => ({ id: t.id, title: t.title, language: t.language, statement: t.statement.slice(0, 300) }));
    return {
      content: [{ type: "text", text: tasks.length ? tasks.map((t) => `${t.id} [${t.language}] ${t.title}`).join("\n") : "No tasks found." }],
      structuredContent: { tasks },
    };
  },
});
