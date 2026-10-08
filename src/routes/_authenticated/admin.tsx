import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { isAdmin } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  // UI gate only; any admin-only server work must re-check app_metadata server-side.
  beforeLoad: ({ context }) => {
    if (!isAdmin(context.user)) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Admin dashboard — CodeTrainer" },
      { name: "description", content: "CodeTrainer administration dashboard." },
      { property: "og:title", content: "Admin dashboard — CodeTrainer" },
      { property: "og:description", content: "CodeTrainer administration dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <main className="mx-auto w-[min(1120px,92%)] flex-1 py-16">
      <h1 className="rise text-3xl font-semibold tracking-tight">Admin dashboard</h1>
      <Link to="/admin/tasks" className="mt-8 block max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glass backdrop-blur-xl transition hover:border-primary">
        <div className="font-semibold">Manage tasks</div>
        <p className="mt-1 text-sm text-muted-foreground">Review, publish and reject submitted tasks.</p>
      </Link>
    </main>
  );
}
