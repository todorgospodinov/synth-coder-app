import { createFileRoute } from "@tanstack/react-router";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";

export const Route = createFileRoute("/_authenticated/add-task")({
  head: () => ({
    meta: [
      { title: "Add Task — CodeTrainer" },
      { name: "description", content: "Submit a new Python task for review." },
      { property: "og:title", content: "Add Task — CodeTrainer" },
      { property: "og:description", content: "Submit a new Python task for review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="mx-auto w-[min(820px,92%)] flex-1 py-12">
      <h1 className="rise mb-2 text-3xl font-semibold tracking-tight">Add Task</h1>
      <p className="mb-6 text-muted-foreground">Your task will be published after an admin approves it.</p>
      <AddTaskForm />
    </main>
  ),
});
