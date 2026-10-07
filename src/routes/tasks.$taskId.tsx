import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { taskQuery } from "@/lib/tasks.queries";
import { TaskDetails } from "@/components/tasks/TaskDetails";

const UUID = /^[0-9a-f-]{36}$/i;

export const Route = createFileRoute("/tasks/$taskId")({
  loader: async ({ params, context }) => {
    if (!UUID.test(params.taskId)) throw notFound();
    const task = await context.queryClient.ensureQueryData(taskQuery(params.taskId));
    if (!task) throw notFound();
    return { title: task.title, statement: task.statement };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Task not found — CodeTrainer" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.title} — CodeTrainer`;
    const description = loaderData.statement.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: TaskPage,
  notFoundComponent: () => (
    <main className="mx-auto flex flex-1 flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-semibold">Task not found</h1>
      <Link to="/" className="mt-4 text-sm text-muted-foreground underline underline-offset-4">Back to tasks</Link>
    </main>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <main className="mx-auto flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">{error.message}</p>
        <button className="mt-4 text-sm underline" onClick={() => { router.invalidate(); reset(); }}>Try again</button>
      </main>
    );
  },
});

function TaskPage() {
  const { taskId } = Route.useParams();
  const { data } = useSuspenseQuery(taskQuery(taskId));
  if (!data) return null;
  return <TaskDetails task={data} />;
}
