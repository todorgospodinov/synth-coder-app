import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { Task } from "@/lib/tasks.functions";
import { Workspace } from "@/components/workspace/Workspace";

/** Task statement plus a pre-filled workspace to solve it. */
export function TaskDetails({ task }: { task: Task }) {
  return (
    <>
      <section className="mx-auto w-[min(1280px,94%)] pt-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> All tasks
        </Link>
        <h1 className="rise mt-4 text-3xl font-semibold tracking-tight">{task.title}</h1>
        <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">{task.statement}</p>
      </section>
      <Workspace key={task.id} initialTask={task.statement} initialCode={task.code} />
    </>
  );
}
