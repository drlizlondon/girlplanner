import { CalendarPlus } from "lucide-react";
import type { Task } from "@/types/task";
import { lifeInboxUrl } from "@/lib/lifeInbox";

export const LifeInboxLink = ({ task }: { task: Pick<Task, "id" | "title" | "additional_info" | "dueDate"> }) => (
  <a
    href={lifeInboxUrl(task)}
    target="_blank"
    rel="noopener"
    title="Send to Life Inbox (Big Picture Planner)"
    aria-label={`Send "${task.title}" to Life Inbox`}
    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm shadow-sm hover:bg-primary/10 hover:text-primary transition"
  >
    <CalendarPlus className="h-4 w-4" />
    Life Inbox
  </a>
);
