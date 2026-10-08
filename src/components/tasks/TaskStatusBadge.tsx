import type { TaskStatus } from "@/lib/task-publishing.functions";

const LABEL: Record<TaskStatus, string> = { for_review: "For review", published: "Published", rejected: "Rejected" };
const STYLE: Record<TaskStatus, string> = {
  for_review: "border-accent text-accent",
  published: "border-primary text-primary",
  rejected: "border-destructive text-destructive",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLE[status]}`}>{LABEL[status]}</span>;
}
