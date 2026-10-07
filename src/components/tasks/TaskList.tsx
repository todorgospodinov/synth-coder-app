import type { TaskSummary } from "@/lib/tasks.functions";
import { TaskCard } from "./TaskCard";

export function TaskList({ tasks, emptyText }: { tasks: TaskSummary[]; emptyText: string }) {
  if (tasks.length === 0) {
    return <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">{emptyText}</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  );
}
