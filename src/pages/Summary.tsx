
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { CompletedTasksTable } from "@/components/completed-tasks/CompletedTasksTable";
import { useCompletedTasks } from "@/hooks/useCompletedTasks";
import { Trash2 } from "lucide-react";

const Summary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-pink-50/70 via-purple-50/30 to-background dark:from-background dark:via-background dark:to-background p-2 sm:p-4 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-4">
        <Header onSignOut={handleSignOut} />
        <div className="bg-card text-card-foreground border border-border rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="space-y-1.5 mb-6 sm:mb-8 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Archive</div>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-semibold text-foreground">
              Completed Tasks
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">Review and celebrate your accomplishments</p>
          </div>
          {selectedTasks.size > 0 && (
            <div className="flex justify-end mb-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete Selected ({selectedTasks.size})</span>
                <span className="sm:hidden">Delete ({selectedTasks.size})</span>
              </Button>
            </div>
          )}
          <div className="overflow-x-auto">
            <CompletedTasksTable
              completedTasks={completedTasks}
              selectedTasks={selectedTasks}
              onSelectAll={handleSelectAll}
              onSelectTask={handleSelectTask}
              onRevertTask={handleRevertTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
