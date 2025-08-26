
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { CompletedTasksTable } from "@/components/completed-tasks/CompletedTasksTable";
import { useCompletedTasks } from "@/hooks/useCompletedTasks";

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Header onSignOut={handleSignOut} />
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h2 className="text-3xl font-dancing-script text-purple-700 font-bold text-center mb-6">
            Completed Tasks
          </h2>
          {selectedTasks.size > 0 && (
            <div className="flex justify-end mb-4">
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2"
              >
                Delete Selected ({selectedTasks.size})
              </Button>
            </div>
          )}
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
  );
};

export default Summary;
