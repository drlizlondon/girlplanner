
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Header onSignOut={handleSignOut} />
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="space-y-2 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-dancing-script text-purple-700 font-bold text-center pb-2">
              Completed Tasks
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">Review your accomplishments</p>
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
