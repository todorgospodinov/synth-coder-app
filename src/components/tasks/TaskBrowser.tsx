import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { tasksQuery } from "@/lib/tasks.queries";
import { TaskSearch } from "./TaskSearch";
import { TaskList } from "./TaskList";

/** Front page browser: 3 most recent tasks by default, all tasks or search results on demand. */
export function TaskBrowser({ q, all }: { q: string; all: boolean }) {
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(tasksQuery(q, all));
  const heading = q ? `Results for "${q}"` : all ? "All tasks" : "Recent tasks";

  return (
    <section className="mx-auto w-[min(1120px,92%)] py-10">
      <TaskSearch key={q} initial={q} onSearch={(next) => navigate({ to: "/", search: { q: next || undefined } })} />
      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
        {q || all ? (
          <Link to="/" search={{}} className="text-sm text-muted-foreground hover:text-foreground">Show recent</Link>
        ) : (
          <Link to="/" search={{ all: true }} className="text-sm text-muted-foreground hover:text-foreground">Browse all tasks</Link>
        )}
      </div>
      <div className="mt-4">
        <TaskList tasks={data} emptyText={q ? "No tasks match your search." : "No tasks published yet."} />
      </div>
    </section>
  );
}
