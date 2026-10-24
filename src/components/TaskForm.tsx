import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { forwardRef, useState } from "react";
import { Priority } from "@/types/task";

interface TaskFormProps {
  onAddTask: (title: string, priority: Priority, dueDate: Date | null) => void;
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const TaskForm = forwardRef<HTMLInputElement, TaskFormProps>(({ onAddTask }, ref) => {
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState("");

  const handleAddTask = () => {
    if (newTask.trim()) {
      // Noon local time keeps the date stable across time zones.
      onAddTask(newTask, priority, due ? new Date(`${due}T12:00:00`) : null);
      setNewTask("");
      setDue("");
      setPriority("medium");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="space-y-3">
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
        <Button onClick={handleAddTask} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div role="radiogroup" aria-label="Priority" className="flex items-center gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={priority === p.value}
              onClick={() => setPriority(p.value)}
              className={`h-8 rounded-full border px-3 text-sm transition-colors ${
                priority === p.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          Due
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          />
        </label>
      </div>
    </div>
  );
});
TaskForm.displayName = "TaskForm";
