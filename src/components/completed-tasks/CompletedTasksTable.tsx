
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Priority } from "@/types/task";

interface CompletedTask {
  id: string;
  title: string;
  type: string;
  priority: Priority;
  completed_at: string;
  created_at: string;
}

interface CompletedTasksTableProps {
  completedTasks: CompletedTask[];
  selectedTasks: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectTask: (taskId: string, checked: boolean) => void;
  onRevertTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const CompletedTasksTable = ({
  completedTasks,
  selectedTasks,
  onSelectAll,
  onSelectTask,
  onRevertTask,
  onDeleteTask,
}: CompletedTasksTableProps) => {
  const renderType = (type: string) => {
    if (type === "_none" || !type) {
      return <span className="text-gray-400 italic">-</span>;
    }
    return type;
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "text-red-500 font-medium";
      case "medium":
        return "text-orange-400";
      case "low":
        return "text-blue-500";
      default:
        return "";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedTasks.size === completedTasks.length && completedTasks.length > 0}
              onCheckedChange={onSelectAll}
              className="translate-y-[2px]"
            />
          </TableHead>
          <TableHead>Task</TableHead>
          <TableHead className="w-[100px]">Type</TableHead>
          <TableHead className="w-24">Priority</TableHead>
          <TableHead>Date Added</TableHead>
          <TableHead>Completion Date</TableHead>
          <TableHead className="w-[140px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {completedTasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <Checkbox
                checked={selectedTasks.has(task.id)}
                onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                className="translate-y-[2px]"
              />
            </TableCell>
            <TableCell className="font-normal">{task.title}</TableCell>
            <TableCell className="font-normal">
              {renderType(task.type)}
            </TableCell>
            <TableCell className={`font-normal ${getPriorityColor(task.priority)}`}>
              {task.priority || "low"}
            </TableCell>
            <TableCell className="font-normal">
              {format(new Date(task.created_at), "dd/MM/yyyy")}
            </TableCell>
            <TableCell className="font-normal">
              {format(new Date(task.completed_at), "dd/MM/yyyy")}
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRevertTask(task.id)}
                className="hover:bg-blue-100 hover:text-blue-500"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteTask(task.id)}
                className="hover:bg-red-100 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
