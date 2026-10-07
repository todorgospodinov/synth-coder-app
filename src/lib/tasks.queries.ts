import { queryOptions } from "@tanstack/react-query";
import { getTask, listTasks } from "./tasks.functions";

export const RECENT_LIMIT = 3;

export const tasksQuery = (q: string, all: boolean) =>
  queryOptions({
    queryKey: ["tasks", q, all],
    queryFn: () => listTasks({ data: { q, limit: q || all ? 100 : RECENT_LIMIT } }),
  });

export const taskQuery = (id: string) =>
  queryOptions({ queryKey: ["task", id], queryFn: () => getTask({ data: { id } }) });
