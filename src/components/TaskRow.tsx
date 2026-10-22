import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
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
      return "text-red-600 dark:text-red-400 font-medium";
    case "medium":
      return "text-amber-600 dark:text-amber-400 font-medium";
    case "low":
      return "text-blue-600 dark:text-blue-400 font-medium";
  }
};

// Advanced view: one card per task. The title gets its own line; priority,
// type, due date and notes sit underneath, and thoughts get a full-width box.
export const TaskRow = ({
  task,
  onTaskCompletion,
  onUpdateTask,
  onDeleteTask,
}: TaskRowProps) => {
  return (
    <li
      data-testid="task-card"
      className={`px-4 py-3 sm:px-5 transition-all duration-300 ${task.completed ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <TaskCheckmark
            completed={task.completed}
            onCheckedChange={(checked) => onTaskCompletion(task.id, checked)}
          />
        </div>
        <div className={`flex-1 min-w-0 pt-1 ${task.completed ? "line-through" : ""}`}>
          <TaskTitle
            title={task.title}
            onUpdate={(title) => onUpdateTask(task.id, { title })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete task"
          onClick={() => onDeleteTask(task.id)}
          className="shrink-0 hover:bg-red-500/10 text-red-600 dark:text-red-400 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 ml-9 flex flex-wrap items-center gap-2">
        <select
          aria-label="Priority"
          className={`h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm ${getPriorityColor(
            task.priority
          )}`}
          value={task.priority}
          onChange={(e) =>
            onUpdateTask(task.id, {
              priority: e.target.value as Task["priority"],
            })
          }
        >
          <option value="low" className="bg-popover text-foreground">Low priority</option>
          <option value="medium" className="bg-popover text-foreground">Medium priority</option>
          <option value="high" className="bg-popover text-foreground">High priority</option>
        </select>
        <TaskTypeSelect
          value={task.type}
          onValueChange={(value) => onUpdateTask(task.id, { type: value })}
        />
        <TaskDueDate
          dueDate={task.dueDate}
          onUpdate={(dueDate) => onUpdateTask(task.id, { dueDate })}
        />
        <TaskAdditionalInfo
          taskId={task.id}
          additionalInfo={task.additional_info || ""}
          onUpdate={(additional_info) => onUpdateTask(task.id, { additional_info })}
        />
      </div>

      {task.additional_info ? (
        <p className="mt-2 ml-9 text-sm text-muted-foreground whitespace-pre-wrap break-words">
          {task.additional_info}
        </p>
      ) : null}

      <div className="mt-2 ml-9">
        <Textarea
          aria-label="Thoughts"
          placeholder="Your thoughts..."
          value={task.thoughts}
          onChange={(e) => onUpdateTask(task.id, { thoughts: e.target.value })}
          className="min-h-[40px] resize-y text-sm"
        />
      </div>
    </li>
  );
};
