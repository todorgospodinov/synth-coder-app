import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { runPython, type RunResult } from "@/lib/python-runner";
import { checkSolution, type AiReview } from "@/lib/ai-check.functions";
import { CodeEditor } from "./CodeEditor";
import { OutputConsole } from "./OutputConsole";
import { AiReviewPanel } from "./AiReviewPanel";

const STARTER_TASK = "Read a number n from input and print the sum of all integers from 1 to n.";
const STARTER_CODE = `n = int(input())\nprint(sum(range(1, n + 1)))\n`;

/** Task + editor + console + AI review: the main write-and-check workspace. */
export function Workspace() {
  const { user } = useAuth();
  const check = useServerFn(checkSolution);
  const [task, setTask] = useState(STARTER_TASK);
  const [code, setCode] = useState(STARTER_CODE);
  const [stdin, setStdin] = useState("10");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [review, setReview] = useState<AiReview | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  async function run(): Promise<RunResult | null> {
    setRunning(true);
    try {
      const r = await runPython(code, stdin);
      setResult(r);
      return r;
    } catch (e) {
      const r = { stdout: "", stderr: e instanceof Error ? e.message : String(e), ok: false, ms: 0 };
      setResult(r);
      return r;
    } finally {
      setRunning(false);
    }
  }

  async function aiCheck() {
    setReviewError(null);
    setReviewing(true);
    try {
      const r = result ?? (await run());
      const output = r ? r.stdout + (r.stderr ? "\n[stderr]\n" + r.stderr : "") : "";
      setReview(await check({ data: { task, code, stdin, output: output.slice(0, 8000) } }));
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "AI check failed.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <main className="mx-auto w-[min(1280px,94%)] flex-1 py-10">
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-glass backdrop-blur-xl">
            <label htmlFor="task" className="text-sm font-semibold">Task</label>
            <Textarea id="task" value={task} onChange={(e) => setTask(e.target.value)} rows={8} className="mt-2" placeholder="Describe the programming task…" />
          </div>
          <AiReviewPanel review={review} loading={reviewing} error={reviewError} signedIn={!!user} />
        </aside>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-glass">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs text-muted-foreground">main.py · Python 3</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={run} disabled={running}>
                <Play className="size-4" /> {running ? "Running…" : "Run"}
              </Button>
              <Button size="sm" variant="secondary" onClick={aiCheck} disabled={!user || reviewing || running}>
                <Sparkles className="size-4" /> Check with AI
              </Button>
            </div>
          </div>
          <CodeEditor value={code} onChange={(v) => { setCode(v); setResult(null); }} onRun={run} />
          <OutputConsole result={result} running={running} stdin={stdin} onStdin={setStdin} />
        </section>
      </div>
    </main>
  );
}
