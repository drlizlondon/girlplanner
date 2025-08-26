import { useEffect } from "react";
import { CompletedTasksTable } from "./completed-tasks/CompletedTasksTable";
import { useCompletedTasks } from "@/hooks/useCompletedTasks";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

export const CompletedTasksWrapper = () => {
  const {
    completedTasks,
    selectedTasks,
    handleSelectAll,
    handleSelectTask,
    handleDeleteSelected,
    handleDeleteTask,
    handleRevertTask,
    fetchCompletedTasks,
  } = useCompletedTasks();

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  if (completedTasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No completed tasks yet. Complete some tasks to see them here!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Completed Tasks ({completedTasks.length})</h3>
        {selectedTasks.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedTasks.size})
          </Button>
        )}
      </div>
      
      <CompletedTasksTable
        completedTasks={completedTasks}
        selectedTasks={selectedTasks}
        onSelectAll={handleSelectAll}
        onSelectTask={handleSelectTask}
        onRevertTask={handleRevertTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
};