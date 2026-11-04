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
      const lists = await Promise.all(
        (["python", "java", "sql"] as const).map((language) => listTasks({ data: { q, limit: RECENT_LIMIT, language } })),
      );
      // Interleave: newest of each language first.
      const out = [];
      for (let i = 0; i < RECENT_LIMIT; i++) for (const l of lists) if (l[i]) out.push(l[i]);
      return out;
    },
  });

export const taskQuery = (id: string) =>
  queryOptions({ queryKey: ["task", id], queryFn: () => getTask({ data: { id } }) });
