import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyTasks } from "@/lib/task-publishing.functions";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";

export const Route = createFileRoute("/_authenticated/my-tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — CodeTrainer" },
      { name: "description", content: "Tasks you have submitted and their review status." },
      { property: "og:title", content: "My Tasks — CodeTrainer" },
      { property: "og:description", content: "Tasks you have submitted and their review status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyTasks,
});

function MyTasks() {
  const fetchMine = useServerFn(listMyTasks);
  const { data, isLoading, error } = useQuery({ queryKey: ["my-tasks"], queryFn: () => fetchMine() });
  return (
    <main className="mx-auto w-[min(1120px,92%)] flex-1 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="rise text-3xl font-semibold tracking-tight">My Tasks</h1>
        <Link to="/add-task" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Add Task</Link>
      </div>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && data.length === 0 && <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">You haven't submitted any tasks yet.</p>}
      <div className="space-y-3">
        {data?.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-glass backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              {t.status === "published" ? (
                <Link to="/tasks/$taskId" params={{ taskId: t.id }} className="font-semibold hover:text-accent">{t.title}</Link>
              ) : (
                <span className="font-semibold">{t.title}</span>
              )}
              <TaskStatusBadge status={t.status} />
            </div>
            <p className="mt-2 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{t.statement}</p>
            <div className="mt-3 font-mono text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
