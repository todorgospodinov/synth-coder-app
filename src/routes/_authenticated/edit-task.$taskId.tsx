import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyTask } from "@/lib/task-publishing.functions";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { isAdmin, useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/edit-task/$taskId")({
  head: () => ({
    meta: [
      { title: "Edit Task — CodeTrainer" },
      { name: "description", content: "Edit your programming task." },
      { property: "og:title", content: "Edit Task — CodeTrainer" },
      { property: "og:description", content: "Edit your programming task." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditTask,
});

function EditTask() {
  const { taskId } = Route.useParams();
  const fetchTask = useServerFn(getMyTask);
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({ queryKey: ["my-task", taskId], queryFn: () => fetchTask({ data: { id: taskId } }) });
  return (
    <main className="mx-auto w-[min(820px,92%)] flex-1 py-12">
      <h1 className="rise mb-2 text-3xl font-semibold tracking-tight">Edit Task</h1>
      <p className="mb-6 text-muted-foreground">
        {isAdmin(user) ? "As an admin, your changes keep the task's current state." : "After saving, the task goes back for review."}
      </p>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && <AddTaskForm initial={{ id: data.id, title: data.title, statement: data.statement, code: data.code, language: data.language }} />}
    </main>
  );
}
