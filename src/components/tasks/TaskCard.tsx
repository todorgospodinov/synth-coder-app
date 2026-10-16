import { Link } from "@tanstack/react-router";
import type { TaskSummary } from "@/lib/tasks.functions";
import { LANGUAGES, asLanguage } from "@/lib/languages";

export function TaskCard({ task }: { task: TaskSummary }) {
  const lang = asLanguage(task.language);
  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: task.id }}
      className="group block rounded-2xl border border-border bg-card p-5 shadow-glass backdrop-blur-xl transition hover:border-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold tracking-tight group-hover:text-accent">{task.title}</h3>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] ${lang === "java" ? "border-violet text-violet" : "border-accent text-accent"}`}>
          {LANGUAGES[lang].label}
        </span>
      </div>
      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{task.statement}</p>
      <div className="mt-4 font-mono text-xs text-muted-foreground">
        {new Date(task.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
}
