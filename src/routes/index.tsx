import { createFileRoute, useRouter } from "@tanstack/react-router";
import { FirstAdminSetup } from "@/components/admin/FirstAdminSetup";
import { TaskBrowser } from "@/components/tasks/TaskBrowser";
import { tasksQuery } from "@/lib/tasks.queries";

type HomeSearch = { q?: string; all?: boolean };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): HomeSearch => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"].slice(0, 100) : undefined,
    all: s["all"] === true || s["all"] === "true" ? true : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "", all: !!search.all }),
  loader: async ({ deps, context }) => {
    await context.queryClient.ensureQueryData(tasksQuery(deps.q, deps.all));
  },
  head: () => ({
    meta: [
      { title: "CodeTrainer — Python tasks with AI assistance" },
      {
        name: "description",
        content: "Browse and search Python programming tasks, solve them online and get AI feedback on your solutions.",
      },
      { property: "og:title", content: "CodeTrainer — Python tasks with AI assistance" },
      {
        property: "og:description",
        content: "Browse and search Python programming tasks, solve them online and get AI feedback on your solutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <main className="mx-auto flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">{error.message}</p>
        <button className="mt-4 text-sm underline" onClick={() => { router.invalidate(); reset(); }}>Try again</button>
      </main>
    );
  },
  notFoundComponent: () => <main className="flex-1 py-24 text-center">Not found</main>,
});

function Index() {
  const { q, all } = Route.useSearch();
  return (
    <main className="flex-1">
      <FirstAdminSetup />
      <TaskBrowser q={q ?? ""} all={!!all} />
    </main>
  );
}
