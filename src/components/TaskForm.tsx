
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { VoiceInput } from "./VoiceInput";

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

  const handleVoiceTranscript = (text: string) => {
    setNewTask(text);
  };

  // Clear task after adding and continue listening
  const handleAddAndListen = () => {
    if (newTask.trim()) {
      onAddTask(newTask);
      setNewTask("");
    }
  };

  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-1 flex items-center relative">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-12"
        />
        <div className="absolute right-2">
          <VoiceInput 
            onTranscript={handleVoiceTranscript} 
            onAddAndListen={handleAddAndListen} 
          />
        </div>
      </div>
      <Button
        onClick={handleAddTask}
        className="bg-gradient-to-r from-pink-400 to-purple-400"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
};
