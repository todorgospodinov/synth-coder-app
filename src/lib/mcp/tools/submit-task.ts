import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "submit_task",
  title: "Submit a task for review",
  description: "Submit a new programming task; it goes to admins for review before publishing.",
  inputSchema: {
    title: z.string().trim().min(3).max(150).describe("Task title."),
    statement: z.string().trim().min(10).max(8000).describe("Problem statement."),
    code: z.string().max(20000).optional().describe("Optional starter code."),
    language: z.enum(["python", "java", "sql"]).optional().describe("Language (default python)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ title, statement, code, language }, ctx) => {
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError("Not signed in.");
    const { data, error } = await supabaseForUser(ctx)
      .from("tasks")
      .insert({ title, statement, code: code ?? "", language: language ?? "python", author_id: userId, status: "for_review", is_published: false })
      .select("id")
      .single();
    if (error) throw new ToolError("Could not submit the task.");
    return {
      content: [{ type: "text", text: `Submitted "${title}" for review (id ${data.id}).` }],
      structuredContent: { id: data.id, status: "for_review" },
    };
  },
});
