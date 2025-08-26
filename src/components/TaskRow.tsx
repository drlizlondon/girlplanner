
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { TaskTypeSelect } from "@/components/TaskTypeSelect";
import { Task } from "@/types/task";
import { TaskCheckmark } from "./task/TaskCheckmark";
import { TaskTitle } from "./task/TaskTitle";
import { TaskAdditionalInfo } from "./task/TaskAdditionalInfo";
import { TaskDueDate } from "./task/TaskDueDate";

interface TaskRowProps {
  task: Task;
  onTaskCompletion: (taskId: string, completed: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-orange-400";
    case "low":
      return "text-blue-500";
  }
};

export const TaskRow = ({
  task,
  onTaskCompletion,
  onUpdateTask,
  onDeleteTask,
}: TaskRowProps) => {
  return (
    <TableRow className={`transition-all duration-300 ${task.completed ? 'opacity-50' : ''}`}>
      <TableCell>
        <TaskCheckmark
          completed={task.completed}
          onCheckedChange={(checked) => onTaskCompletion(task.id, checked)}
        />
      </TableCell>
      <TableCell>
        <TaskTitle
          title={task.title}
          onUpdate={(title) => onUpdateTask(task.id, { title })}
        />
      </TableCell>
      <TableCell>
        <TaskAdditionalInfo
          taskId={task.id}
          additionalInfo={task.additional_info || ""}
          onUpdate={(additional_info) => onUpdateTask(task.id, { additional_info })}
        />
      </TableCell>
      <TableCell>
        <Textarea
          placeholder="Your thoughts..."
          value={task.thoughts}
          onChange={(e) =>
            onUpdateTask(task.id, { thoughts: e.target.value })
          }
          className="min-h-[40px] resize-none"
        />
      </TableCell>
      <TableCell>
        <TaskTypeSelect
          value={task.type}
          onValueChange={(value) =>
            onUpdateTask(task.id, { type: value })
          }
        />
      </TableCell>
      <TableCell>
        <select
          className={`w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ${getPriorityColor(
            task.priority
          )}`}
          value={task.priority}
          onChange={(e) =>
            onUpdateTask(task.id, {
              priority: e.target.value as Task["priority"],
            })
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </TableCell>
      <TableCell>
        <TaskDueDate
          dueDate={task.dueDate}
          onUpdate={(dueDate) => onUpdateTask(task.id, { dueDate })}
        />
      </TableCell>
      <TableCell>
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
  );
};
