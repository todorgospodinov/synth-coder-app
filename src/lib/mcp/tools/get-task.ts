import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_task",
  title: "Get task details",
  description: "Get the full statement and starter code of a task you can see (published or your own).",
  inputSchema: { id: z.string().uuid().describe("Task id from search_tasks or list_my_tasks.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("tasks")
      .select("id, title, statement, code, language, status")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new ToolError("Could not load the task.");
    if (!data) throw new ToolError("Task not found.");
    const task = { id: data.id, title: data.title, statement: data.statement, code: data.code, language: data.language, status: data.status };
    return {
      content: [{ type: "text", text: `${task.title} [${task.language}, ${task.status}]\n\n${task.statement}\n\nStarter code:\n${task.code || "(none)"}` }],
      structuredContent: { task },
    };
  },
});
