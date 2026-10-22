
import { TaskRow } from "./TaskRow";
import { Task } from "@/types/task";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortField = 'created_at' | 'due_date' | 'priority' | 'type';
export type SortOrder = 'asc' | 'desc';

interface TaskTableProps {
  tasks: Task[];
  onTaskCompletion: (taskId: string, completed: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSortChange?: (field: SortField, order: SortOrder) => void;
}

export const TaskTable = ({
  tasks,
  onTaskCompletion,
  onUpdateTask,
  onDeleteTask,
  sortField = 'created_at',
  sortOrder = 'desc',
  onSortChange,
}: TaskTableProps) => {
  const handleSort = (field: SortField) => {
    if (onSortChange) {
      if (sortField === field) {
        onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        onSortChange(field, 'asc');
      }
    }
  };

  const sortLabels: Record<SortField, string> = {
    created_at: "Date added",
    due_date: "Due date",
    priority: "Priority",
    type: "Type",
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 sm:px-5">
        <span className="text-sm font-medium text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-sm">
              <ArrowUpDown className="h-4 w-4" />
              Sort: {sortLabels[sortField]} {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(sortLabels) as SortField[]).map((field) => (
              <DropdownMenuItem key={field} onClick={() => handleSort(field)}>
                {sortLabels[field]} {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ul className="divide-y divide-border">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onTaskCompletion={onTaskCompletion}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </ul>
    </div>
  );
};
