import { useState, useCallback } from "react";
import { dataService } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { Priority } from "@/types/task";

interface CompletedTask {
  id: string;
  title: string;
  type: string;
  priority: Priority;
  completed_at: string;
  created_at: string;
}

export const useCompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchCompletedTasks = async () => {
    try {
      const data = await dataService.getCompletedTasks();
      setCompletedTasks(data.map(task => ({
        id: task.id,
        title: task.title,
        type: task.type,
        priority: task.priority as Priority,
        completed_at: task.completed_at || "",
        created_at: task.created_at,
      })));
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    }
  };

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(completedTasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  }, [completedTasks]);

  const handleSelectTask = useCallback((taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  }, [selectedTasks]);

  const handleDeleteSelected = async () => {
    try {
      let deletedCount = 0;
      
      for (const taskId of selectedTasks) {
        if (await dataService.deleteCompletedTask(taskId)) {
          deletedCount++;
        }
      }

      if (deletedCount === 0) {
        toast({
          title: "Error",
          description: "Failed to delete tasks",
        });
        return;
      }

      setCompletedTasks(tasks => tasks.filter(task => !selectedTasks.has(task.id)));
      setSelectedTasks(new Set());
      toast({
        title: "Tasks deleted",
        description: `${deletedCount} tasks have been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tasks",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await dataService.deleteCompletedTask(taskId);

      if (!success) {
        toast({
          title: "Error",
          description: "Failed to delete task",
        });
        return;
      }

      setCompletedTasks(tasks => tasks.filter(task => task.id !== taskId));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
      });
    }
  };

  const handleRevertTask = async (taskId: string) => {
    try {
      const success = await dataService.revertTask(taskId);

      if (!success) {
        toast({
          title: "Error",
          description: "Failed to revert task",
        });
        return;
      }

      setCompletedTasks(tasks => tasks.filter(task => task.id !== taskId));
      toast({
        title: "Task Reverted",
        description: "Task moved back to active tasks",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revert task",
      });
    }
  };

  return {
    completedTasks,
    selectedTasks,
    handleSelectAll,
    handleSelectTask,
    handleDeleteSelected,
    handleDeleteTask,
    handleRevertTask,
    fetchCompletedTasks,
  };
};
