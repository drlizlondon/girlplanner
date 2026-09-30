
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

interface TaskFormProps {
  onAddTask: (title: string) => void;
}

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask);
      setNewTask("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 mb-8">
      <div className="flex-1">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          className="bg-background text-foreground border-border placeholder:text-muted-foreground focus-visible:ring-primary shadow-sm"
        />
      </div>
      <Button
        onClick={handleAddTask}
        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium shadow-sm transition-opacity shrink-0"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
};
