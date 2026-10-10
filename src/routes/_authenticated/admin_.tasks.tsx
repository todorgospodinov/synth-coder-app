import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { isAdmin } from "@/hooks/use-auth";
import { adminListTasks, adminSetTaskStatus, type TaskStatus } from "@/lib/task-publishing.functions";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { DeleteTaskButton } from "@/components/tasks/DeleteTaskButton";

export const Route = createFileRoute("/_authenticated/admin_/tasks")({
  beforeLoad: ({ context }) => {
    if (!isAdmin(context.user)) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Manage tasks — CodeTrainer Admin" },
      { name: "description", content: "Review, publish and reject submitted tasks." },
      { property: "og:title", content: "Manage tasks — CodeTrainer Admin" },
      { property: "og:description", content: "Review, publish and reject submitted tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTasks,
});

const SECTIONS: { status: TaskStatus; title: string }[] = [
  { status: "for_review", title: "Waiting for review" },
  { status: "published", title: "Published" },
  { status: "rejected", title: "Rejected" },
];

function AdminTasks() {
  const list = useServerFn(adminListTasks);
  const setStatus = useServerFn(adminSetTaskStatus);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-tasks"], queryFn: () => list() });

  async function change(id: string, status: "published" | "rejected") {
    try {
      await setStatus({ data: { id, status } });
      toast.success(status === "published" ? "Task published" : "Task rejected");
      await qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  const btn = "rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-secondary";
  return (
    <main className="mx-auto w-[min(1120px,92%)] flex-1 py-12">
      <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Admin dashboard</Link>
      <h1 className="rise mt-2 mb-8 text-3xl font-semibold tracking-tight">Manage tasks</h1>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && SECTIONS.map((s) => {
        const items = data.filter((t) => t.status === s.status);
        return (
          <section key={s.status} className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">{s.title} <span className="text-muted-foreground">({items.length})</span></h2>
            {items.length === 0 && <p className="text-sm text-muted-foreground">No tasks.</p>}
            <div className="space-y-3">
              {items.map((t) => (
                <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-glass backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{t.title}</span>
                      <TaskStatusBadge status={t.status} />
                    </div>
                    <div className="flex gap-2">
                      <Link to="/tasks/$taskId" params={{ taskId: t.id }} className={btn}>View</Link>
                      <Link to="/edit-task/$taskId" params={{ taskId: t.id }} className={btn}>Edit</Link>
                      {t.status !== "published" && <button className={`${btn} text-primary`} onClick={() => change(t.id, "published")}>Publish</button>}
                      {t.status !== "rejected" && <button className={`${btn} text-destructive`} onClick={() => change(t.id, "rejected")}>Reject</button>}
                      <DeleteTaskButton id={t.id} title={t.title} />
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{t.statement}</p>
                  <div className="mt-3 font-mono text-xs text-muted-foreground">
                    {t.author_email ?? "No author"} · {new Date(t.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
