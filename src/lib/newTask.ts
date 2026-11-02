// What the add row sends for a task typed with only text: Medium priority,
// no due date. She can change either afterwards on the task itself.
export type NewTaskPriority = "high" | "medium" | "low";

export interface NewTaskInput {
  title: string;
  priority: NewTaskPriority;
  dueDate: Date | null;
}

export function newTaskFromText(text: string): NewTaskInput | null {
  const title = text.trim();
  if (!title) return null;
  return { title, priority: "medium", dueDate: null };
}
