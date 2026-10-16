import { queryOptions } from "@tanstack/react-query";
import { getTask, listTasks } from "./tasks.functions";
import type { Language } from "./languages";

export const RECENT_LIMIT = 3;

export const tasksQuery = (q: string, all: boolean, language?: Language) =>
  queryOptions({
    queryKey: ["tasks", q, all, language ?? "any"],
    queryFn: () => listTasks({ data: { q, limit: q || all ? 100 : RECENT_LIMIT, language } }),
  });

export const taskQuery = (id: string) =>
  queryOptions({ queryKey: ["task", id], queryFn: () => getTask({ data: { id } }) });
