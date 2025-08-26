
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead className="flex items-center gap-2">
              Task
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleSort('created_at')}>
                    Date Added {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('due_date')}>
                    Due Date {sortField === 'due_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('priority')}>
                    Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('type')}>
                    Type {sortField === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Thoughts</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onTaskCompletion={onTaskCompletion}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
