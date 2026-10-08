import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitTask } from "@/lib/task-publishing.functions";

const field = "w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary";

/** Form for submitting a new task for admin review. */
export function AddTaskForm() {
  const submit = useServerFn(submitTask);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 3) return setError("Title must be at least 3 characters.");
    if (statement.trim().length < 10) return setError("Problem statement must be at least 10 characters.");
    setBusy(true);
    try {
      await submit({ data: { title, statement, code } });
      await qc.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("Task submitted for review");
      navigate({ to: "/my-tasks" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-glass backdrop-blur-xl">
      <label className="block space-y-1.5">
        <span className="text-sm text-muted-foreground">Title</span>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-muted-foreground">Problem statement</span>
        <textarea className={`${field} min-h-40`} value={statement} onChange={(e) => setStatement(e.target.value)} maxLength={8000} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-muted-foreground">Starter code (optional)</span>
        <textarea className={`${field} min-h-40 font-mono`} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
        {busy ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
