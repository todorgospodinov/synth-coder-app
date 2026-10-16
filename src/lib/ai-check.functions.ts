import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  language: z.enum(["python", "java"]).default("python"),
  task: z.string().max(8000),
  code: z.string().min(1).max(20000),
  stdin: z.string().max(4000),
  output: z.string().max(8000),
});

export type AiReview = {
  verdict: "correct" | "partially_correct" | "incorrect";
  score: number;
  summary: string;
  issues: string[];
  suggestions: string[];
};

const SYSTEM = (lang: string) => `You are a strict but friendly ${lang} programming teacher. Evaluate whether the student's code solves the task.
Reply ONLY with JSON: {"verdict":"correct"|"partially_correct"|"incorrect","score":0-100,"summary":string,"issues":string[],"suggestions":string[]}.
Do not include a full corrected solution; give hints. Keep each item short.`;

/** Asks Gemini (via Lovable AI Gateway) to review a solution. Signed-in users only. */
export const checkSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiReview> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");
    const user = `TASK:\n${data.task || "(no task text — infer intent from code)"}\n\nCODE:\n\`\`\`${data.language}\n${data.code}\n\`\`\`\n\nSTDIN:\n${data.stdin || "(empty)"}\n\nPROGRAM OUTPUT:\n${data.output || "(not run)"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM(data.language === "java" ? "Java" : "Python") },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Too many requests — please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits are used up for this workspace.");
    if (!res.ok || !res.body) throw new Error(`AI check failed (${res.status}).`);

    // Accumulate the streamed answer.
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const payload = t.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          text += JSON.parse(payload).choices?.[0]?.delta?.content ?? "";
        } catch {
          /* partial frame */
        }
      }
    }

    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    try {
      const r = JSON.parse(json) as Partial<AiReview>;
      return {
        verdict: r.verdict ?? "incorrect",
        score: Math.max(0, Math.min(100, Number(r.score) || 0)),
        summary: r.summary ?? "",
        issues: Array.isArray(r.issues) ? r.issues : [],
        suggestions: Array.isArray(r.suggestions) ? r.suggestions : [],
      };
    } catch {
      return { verdict: "incorrect", score: 0, summary: text || "The AI returned no answer.", issues: [], suggestions: [] };
    }
  });
