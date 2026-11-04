import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_tasks",
  title: "List my tasks",
  description: "List tasks you authored, with their review status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError("Not signed in.");
    const { data, error } = await supabaseForUser(ctx)
      .from("tasks")
      .select("id, title, language, status, created_at")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new ToolError("Could not load your tasks.");
    const tasks = data.map((t) => ({ id: t.id, title: t.title, language: t.language, status: t.status }));
    return {
      content: [{ type: "text", text: tasks.length ? tasks.map((t) => `${t.id} [${t.language}, ${t.status}] ${t.title}`).join("\n") : "You have no tasks yet." }],
      structuredContent: { tasks },
    };
  },
});
