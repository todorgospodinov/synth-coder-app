import { Link } from "@tanstack/react-router";
import type { TaskSummary } from "@/lib/tasks.functions";

export function TaskCard({ task }: { task: TaskSummary }) {
  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: task.id }}
      className="group block rounded-2xl border border-border bg-card p-5 shadow-glass backdrop-blur-xl transition hover:border-primary"
    >
      <h3 className="font-semibold tracking-tight group-hover:text-accent">{task.title}</h3>
      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{task.statement}</p>
      <div className="mt-4 font-mono text-xs text-muted-foreground">
        {new Date(task.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
}
