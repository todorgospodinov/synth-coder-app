import { createFileRoute } from "@tanstack/react-router";
import { TaskBrowser } from "@/components/tasks/TaskBrowser";
import { Workspace } from "@/components/workspace/Workspace";
import { tasksQuery } from "@/lib/tasks.queries";

type S = { q?: string | undefined; all?: boolean | undefined };
const SQL_STARTER = `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);
INSERT INTO employees (name, salary) VALUES ('Ana', 3200), ('Ivan', 2800), ('Maria', 4100);

SELECT name, salary FROM employees WHERE salary > 3000 ORDER BY salary DESC;
`;

export const Route = createFileRoute("/sql")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"].slice(0, 100) : undefined,
    all: s["all"] === true || s["all"] === "true" ? true : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "", all: !!search.all }),
  loader: ({ deps, context }) => context.queryClient.ensureQueryData(tasksQuery(deps.q, deps.all, "sql")),
  head: () => ({
    meta: [
      { title: "SQL exercises — CodeTrainer" },
      { name: "description", content: "Solve SQL exercises in the browser and get AI feedback on your solutions." },
      { property: "og:title", content: "SQL exercises — CodeTrainer" },
      { property: "og:description", content: "Solve SQL exercises in the browser and get AI feedback on your solutions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SqlPage,
});

function SqlPage() {
  const { q, all } = Route.useSearch();
  return (
    <main className="flex-1">
      <TaskBrowser q={q ?? ""} all={!!all} language="sql" />
      <Workspace language="sql" initialTask="List the names and salaries of employees earning more than 3000, highest salary first." initialCode={SQL_STARTER} />
    </main>
  );
}
