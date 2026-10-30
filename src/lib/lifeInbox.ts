/**
 * "Send to Life Inbox": open Big Picture Planner with this task filled in.
 * BPP asks "Add to your Life Inbox?" and adds it on the tap. It keys the item
 * on this task's id, so sending twice never makes two (BPP src/utils/inboxHandoff.ts).
 */
import type { Task } from "@/types/task";

export const BPP_PLANNER_URL = "https://bigpictureplanner.app/planner/";

const pad = (n: number) => String(n).padStart(2, "0");
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const lifeInboxUrl = (task: Pick<Task, "id" | "title" | "additional_info" | "dueDate">, base = BPP_PLANNER_URL): string => {
  const params = new URLSearchParams({
    add_to_inbox: "1",
    from: "girlplanner",
    ref: task.id,
    title: task.title.trim().slice(0, 200),
  });
  const notes = (task.additional_info || "").trim().slice(0, 1000);
  if (notes) params.set("notes", notes);
  if (task.dueDate instanceof Date && !Number.isNaN(task.dueDate.getTime())) params.set("due", localDate(task.dueDate));
  return `${base}?${params.toString()}`;
};
