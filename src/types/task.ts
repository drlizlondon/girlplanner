
export type Priority = "high" | "medium" | "low";

export type TaskStatus = "active" | "focus" | "paused" | "archived" | "completed";

export interface Task {
  id: string;
  title: string;
  type: string;
  priority: Priority;
  additional_info?: string;
  thoughts?: string;
  dueDate?: Date;
  completed: boolean;
  files: File[];
  created_at?: string;
  completed_at?: string;
  status?: TaskStatus;
  project_id?: string | null;
}
