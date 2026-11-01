import { queryOptions } from "@tanstack/react-query";
import { getTask, listTasks } from "./tasks.functions";
import type { Language } from "./languages";

export const RECENT_LIMIT = 3;

export const tasksQuery = (q: string, all: boolean, language?: Language) =>
  queryOptions({
    queryKey: ["tasks", q, all, language ?? "any"],
    queryFn: async () => {
      if (q || all || language) return listTasks({ data: { q, limit: q || all ? 100 : RECENT_LIMIT, language } });
      // Home: recent tasks of both languages, interleaved.
      const [py, java] = await Promise.all([
        listTasks({ data: { q, limit: RECENT_LIMIT, language: "python" } }),
        listTasks({ data: { q, limit: RECENT_LIMIT, language: "java" } }),
      ]);
      return py.flatMap((t, i) => (java[i] ? [t, java[i]] : [t])).concat(java.slice(py.length));
    },
  });

export const taskQuery = (id: string) =>
  queryOptions({ queryKey: ["task", id], queryFn: () => getTask({ data: { id } }) });
