import { createFileRoute } from "@tanstack/react-router";
import { TaskBrowser } from "@/components/tasks/TaskBrowser";
import { Workspace } from "@/components/workspace/Workspace";
import { tasksQuery } from "@/lib/tasks.queries";

type S = { q?: string | undefined; all?: boolean | undefined };
const JAVA_STARTER = `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println((long) n * (n + 1) / 2);\n    }\n}\n`;

export const Route = createFileRoute("/java")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"].slice(0, 100) : undefined,
    all: s["all"] === true || s["all"] === "true" ? true : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "", all: !!search.all }),
  loader: ({ deps, context }) => context.queryClient.ensureQueryData(tasksQuery(deps.q, deps.all, "java")),
  head: () => ({
    meta: [
      { title: "Java tasks — CodeTrainer" },
      { name: "description", content: "Solve Java programming tasks in the browser and get AI feedback on your solutions." },
      { property: "og:title", content: "Java tasks — CodeTrainer" },
      { property: "og:description", content: "Solve Java programming tasks in the browser and get AI feedback on your solutions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JavaPage,
});

function JavaPage() {
  const { q, all } = Route.useSearch();
  return (
    <main className="flex-1">
      <TaskBrowser q={q ?? ""} all={!!all} language="java" />
      <Workspace language="java" initialTask="Read a number n from input and print the sum of all integers from 1 to n." initialCode={JAVA_STARTER} />
    </main>
  );
}
