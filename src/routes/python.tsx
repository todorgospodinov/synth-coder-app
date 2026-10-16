import { createFileRoute } from "@tanstack/react-router";
import { TaskBrowser } from "@/components/tasks/TaskBrowser";
import { Workspace } from "@/components/workspace/Workspace";
import { tasksQuery } from "@/lib/tasks.queries";

type S = { q?: string | undefined; all?: boolean | undefined };

export const Route = createFileRoute("/python")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"].slice(0, 100) : undefined,
    all: s["all"] === true || s["all"] === "true" ? true : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "", all: !!search.all }),
  loader: ({ deps, context }) => context.queryClient.ensureQueryData(tasksQuery(deps.q, deps.all, "python")),
  head: () => ({
    meta: [
      { title: "Python tasks — CodeTrainer" },
      { name: "description", content: "Solve Python programming tasks in the browser and get AI feedback on your solutions." },
      { property: "og:title", content: "Python tasks — CodeTrainer" },
      { property: "og:description", content: "Solve Python programming tasks in the browser and get AI feedback on your solutions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PythonPage,
});

function PythonPage() {
  const { q, all } = Route.useSearch();
  return (
    <main className="flex-1">
      <TaskBrowser q={q ?? ""} all={!!all} language="python" />
      <Workspace language="python" initialTask="Read a number n from input and print the sum of all integers from 1 to n." initialCode={`n = int(input())\nprint(sum(range(1, n + 1)))\n`} />
    </main>
  );
}
