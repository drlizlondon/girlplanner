
import { TaskTable } from "@/components/TaskTable";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { useTasks } from "@/hooks/useTasks";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, User, Cloud, HardDrive, Trash2 } from "lucide-react";
import { Task, Priority } from "@/types/task";

import { AuthModal } from "@/components/AuthModal";
import { dataService } from "@/lib/dataService";
import { CompletedTasksWrapper } from "@/components/CompletedTasksWrapper";

const Agenda = () => {
  const { tasks, addTask, completeTask, updateTask, deleteTask } = useTasks();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdvancedView, setIsAdvancedView] = useState(false);
  const [sortField, setSortField] = useState<'created_at' | 'due_date' | 'priority' | 'type'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'supabase'>('local');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = await dataService.isUserAuthenticated();
      setIsAuthenticated(authenticated);
      setStorageType(dataService.getStorageType());
    };
    checkAuthStatus();
  }, []);

  const handleSignOut = async () => {
    if (isAuthenticated) {
      await dataService.signOut();
      setIsAuthenticated(false);
      setStorageType('local');
      toast({
        title: "Signed out",
        description: "You've been signed out. Now using local storage.",
      });
    } else {
      navigate("/");
      toast({
        title: "Returned to home",
        description: "You've returned to the home page.",
      });
    }
  };

  const handleAuthSuccess = async () => {
    const authenticated = await dataService.isUserAuthenticated();
    setIsAuthenticated(authenticated);
    setStorageType(dataService.getStorageType());
    // Refresh tasks after authentication
    window.location.reload();
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "text-red-500 font-medium";
      case "medium":
        return "text-orange-400";
      case "low":
        return "text-blue-500";
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'created_at':
        return multiplier * ((new Date(a.created_at || 0)).getTime() - (new Date(b.created_at || 0)).getTime());
      case 'due_date':
        const aDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
        const bDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
        return multiplier * (aDate - bDate);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'type':
        return multiplier * (a.type || '').localeCompare(b.type || '');
      default:
        return 0;
    }
  });

  const BasicTable = () => (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 sm:w-12 text-xs sm:text-sm">Done</TableHead>
            <TableHead className="text-xs sm:text-sm">Task</TableHead>
            <TableHead className="w-20 sm:w-24 text-xs sm:text-sm">Priority</TableHead>
            <TableHead className="w-16 sm:w-20 text-xs sm:text-sm">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="p-2 sm:p-4">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => completeTask(task.id, true)}
                    className="h-4 w-4 sm:h-5 sm:w-5 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-transparent hover:text-gray-400" />
                  </button>
                </div>
              </TableCell>
              <TableCell className="p-2 sm:p-4 text-xs sm:text-sm">{task.title}</TableCell>
              <TableCell className="p-2 sm:p-4">
                <select
                  className={`w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs sm:text-sm shadow-sm ${getPriorityColor(task.priority)}`}
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Med</option>
                  <option value="high">High</option>
                </select>
              </TableCell>
              <TableCell className="p-2 sm:p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Header onSignOut={handleSignOut} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Storage Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-muted/50 rounded-lg p-3 sm:p-4 gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              {storageType === 'supabase' ? (
                <>
                  <Cloud className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Synced to Cloud</span>
                  <span className="hidden sm:inline text-xs text-muted-foreground">(Your tasks are saved to your account)</span>
                </>
              ) : (
                <>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Local Storage</span>
                  <span className="hidden sm:inline text-xs text-muted-foreground">(Tasks saved on this device only)</span>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign In to Sync</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}
          </div>

          <div className="space-y-2 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-dancing-script text-purple-700 font-bold text-center pb-2">
              My Agenda
            </h2>
            <p className="text-center text-gray-600 text-sm sm:text-base">Your personal task manager</p>
          </div>
          <TaskForm onAddTask={addTask} />
          
          
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-4">
            <div className="flex gap-2 sm:gap-4">
              <Button
                variant={showCompleted ? "default" : "outline"}
                onClick={() => setShowCompleted(!showCompleted)}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{showCompleted ? "Hide Completed" : "Show Completed"}</span>
                <span className="sm:hidden">{showCompleted ? "Hide" : "Show"} Done</span>
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsAdvancedView(!isAdvancedView)}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">{isAdvancedView ? "Switch to Basic View" : "Switch to Advanced View"}</span>
              <span className="sm:hidden">{isAdvancedView ? "Basic" : "Advanced"}</span>
            </Button>
          </div>
          
          {isAdvancedView ? (
            <TaskTable
              tasks={sortedTasks}
              onTaskCompletion={completeTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortField(field);
                setSortOrder(order);
              }}
            />
          ) : (
            <BasicTable />
          )}
          
          {showCompleted && <CompletedTasksWrapper />}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Agenda;
