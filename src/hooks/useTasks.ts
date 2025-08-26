
import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/lib/dataService";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      await dataService.initialize();
      fetchTasks();
    };
    initializeData();
  }, []);

  const fetchTasks = async () => {
    try {
      const taskData = await dataService.getTasks();
      setTasks(taskData.map(task => ({
        ...task,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        files: [] // Initialize empty files array
      })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "There was a problem loading your tasks.",
      });
    }
  };

  const addTask = async (title: string) => {
    if (!title.trim()) return;

    try {
      const createdTask = await dataService.addTask(title);
      const formattedTask: Task = {
        ...createdTask,
        dueDate: createdTask.due_date ? new Date(createdTask.due_date) : undefined,
        files: []
      };

      setTasks([formattedTask, ...tasks]);
      toast({
        title: "Task added",
        description: "Your new task has been added to the agenda.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error adding task",
        description: "There was a problem adding your task.",
      });
    }
  };

  const completeTask = async (taskId: string, completed: boolean) => {
    if (completed) {
      try {
        const success = await dataService.completeTask(taskId);
        
        if (!success) {
          toast({
            title: "Error completing task",
            description: "Task not found.",
          });
          return;
        }

        setTasks(tasks.filter((task) => task.id !== taskId));
        toast({
          title: "🎉 Task completed!",
          description: "Great job! Task marked as completed.",
        });
      } catch (error) {
        console.error('Error completing task:', error);
        toast({
          title: "Error completing task",
          description: "There was a problem completing your task.",
        });
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const success = await dataService.deleteTask(taskId);
      
      if (!success) {
        toast({
          title: "Error deleting task",
          description: "Task not found.",
        });
        return;
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      toast({
        title: "Task deleted",
        description: "The task has been removed from your agenda.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: "There was a problem deleting your task.",
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const localUpdates = {
        ...updates,
        due_date: updates.dueDate?.toISOString(),
      };

      delete localUpdates.dueDate;
      delete localUpdates.files;

      const updatedTask = await dataService.updateTask(taskId, localUpdates);
      
      if (!updatedTask) {
        toast({
          title: "Error updating task",
          description: "Task not found.",
        });
        return;
      }

      setTasks(
        tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, ...updates };
          }
          return task;
        })
      );
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "There was a problem updating your task.",
      });
    }
  };

  return {
    tasks,
    addTask,
    completeTask,
    deleteTask,
    updateTask,
  };
};
