// Pure helpers for the list-first Today page (GPL-1). No React, so node --test can run them.

export type Priority = "high" | "medium" | "low";

export interface SortableTask {
  priority: Priority;
  dueDate?: Date;
  created_at?: string;
}

const RANK: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Overdue first, then due date ascending, then no date; within each, High > Medium > Low; then newest first. */
export function sortToday<T extends SortableTask>(tasks: T[], now: Date = new Date()): T[] {
  const today = startOfDay(now).getTime();
  const group = (t: T) => (!t.dueDate ? 2 : startOfDay(t.dueDate).getTime() < today ? 0 : 1);
  return [...tasks].sort((a, b) => {
    const g = group(a) - group(b);
    if (g) return g;
    if (a.dueDate && b.dueDate) {
      const d = startOfDay(a.dueDate).getTime() - startOfDay(b.dueDate).getTime();
      if (d) return d;
    }
    const p = RANK[b.priority] - RANK[a.priority];
    if (p) return p;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

/** Tapping the priority chip: Medium -> High -> Low -> Medium. */
export function nextPriority(p: Priority): Priority {
  return p === "medium" ? "high" : p === "high" ? "low" : "medium";
}

export const PRIORITY_LABEL: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Add date", "Today", "Tomorrow", "Mon 3 Nov", or "Overdue · 30 Oct". */
export function dueLabel(due: Date | undefined, now: Date = new Date()): { text: string; overdue: boolean } {
  if (!due) return { text: "Add date", overdue: false };
  const days = Math.round((startOfDay(due).getTime() - startOfDay(now).getTime()) / 86_400_000);
  if (days < 0) return { text: `Overdue · ${due.getDate()} ${MONTHS[due.getMonth()]}`, overdue: true };
  if (days === 0) return { text: "Today", overdue: false };
  if (days === 1) return { text: "Tomorrow", overdue: false };
  return { text: `${DAYS[due.getDay()]} ${due.getDate()} ${MONTHS[due.getMonth()]}`, overdue: false };
}

/** <input type="date"> value -> a Date at local noon, so the saved timestamp never slips a day. */
export function dateFromInput(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12) : undefined;
}

export function dateToInput(d: Date | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
