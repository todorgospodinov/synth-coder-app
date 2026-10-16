import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { tasksQuery } from "@/lib/tasks.queries";
import { LANGUAGES, type Language } from "@/lib/languages";
import { TaskSearch } from "./TaskSearch";
import { TaskList } from "./TaskList";

/** Task browser: 3 most recent by default, all or search results on demand. No language = mixed (home). */
export function TaskBrowser({ q, all, language }: { q: string; all: boolean; language?: Language }) {
  const navigate = useNavigate();
  const to = language ? LANGUAGES[language].path : "/";
  const { data } = useSuspenseQuery(tasksQuery(q, all, language));
  const prefix = language ? `${LANGUAGES[language].label} ` : "";
  const heading = q ? `Results for "${q}"` : all ? `All ${prefix}tasks` : `Recent ${prefix}tasks`;

  return (
    <section className="mx-auto w-[min(1120px,92%)] py-10">
      {language && <h1 className="rise mb-6 text-3xl font-semibold tracking-tight">{LANGUAGES[language].label} tasks</h1>}
      <TaskSearch key={q} initial={q} onSearch={(next) => navigate({ to, search: { q: next || undefined } })} />
      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
        {q || all ? (
          <Link to={to} search={{}} className="text-sm text-muted-foreground hover:text-foreground">Show recent</Link>
        ) : (
          <Link to={to} search={{ all: true }} className="text-sm text-muted-foreground hover:text-foreground">Browse all tasks</Link>
        )}
      </div>
      <div className="mt-4">
        <TaskList tasks={data} emptyText={q ? "No tasks match your search." : "No tasks published yet."} />
      </div>
    </section>
  );
}
