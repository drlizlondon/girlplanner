import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { forwardRef, useState } from "react";
import { Priority } from "@/types/task";
import { newTaskFromText } from "@/lib/newTask";

interface TaskFormProps {
  onAddTask: (title: string, priority: Priority, dueDate: Date | null) => void;
}

export const TaskForm = forwardRef<HTMLInputElement, TaskFormProps>(({ onAddTask }, ref) => {
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    const task = newTaskFromText(newTask);
    if (task) {
      onAddTask(task.title, task.priority, task.dueDate);
      setNewTask("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="flex gap-3">
      <Input
        ref={ref}
        aria-label="New task"
        placeholder="What do you need to do?"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary"
      />
      <Button onClick={handleAddTask} className="btn-brand shrink-0">
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
});
TaskForm.displayName = "TaskForm";
