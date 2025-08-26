import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lightbulb, Target, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { AIService } from "@/lib/aiService";
import { AIResponseDialog } from "./AIResponseDialog";

interface AITaskHelperProps {
  tasks: Task[];
}

export const AITaskHelper = ({ tasks }: AITaskHelperProps) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePrioritizeTasks = async () => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to prioritize",
        description: "Add some tasks first to get AI prioritization suggestions.",
        variant: "default",
      });
      return;
    }

    setDialogTitle("AI Task Prioritization");
    setDialogOpen(true);
    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await AIService.prioritizeTasks(tasks);
      setAiResponse(response);
    } catch (error) {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI assistance",
        variant: "destructive",
      });
      setDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestTasks = async () => {
    setDialogTitle("AI Task Suggestions");
    setDialogOpen(true);
    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await AIService.suggestTasks(tasks);
      setAiResponse(response);
    } catch (error) {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI assistance",
        variant: "destructive",
      });
      setDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHelp = async () => {
    setDialogTitle("AI General Help");
    setDialogOpen(true);
    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await AIService.getTaskHelp("I need general help with task management and productivity.");
      setAiResponse(response);
    } catch (error) {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to get AI assistance",
        variant: "destructive",
      });
      setDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          AI Task Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <Button
            onClick={handlePrioritizeTasks}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm p-2 sm:p-3 hover:bg-purple-50 hover:border-purple-300"
            disabled={isLoading}
          >
            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Prioritize Tasks</span>
            <span className="sm:hidden">Prioritize</span>
          </Button>
          
          <Button
            onClick={handleSuggestTasks}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm p-2 sm:p-3 hover:bg-purple-50 hover:border-purple-300"
            disabled={isLoading}
          >
            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Suggest Tasks</span>
            <span className="sm:hidden">Suggest</span>
          </Button>
          
          <Button
            onClick={handleGetHelp}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm p-2 sm:p-3 sm:col-span-2 lg:col-span-1 hover:bg-purple-50 hover:border-purple-300"
            disabled={isLoading}
          >
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Get Help</span>
            <span className="sm:hidden">Help</span>
          </Button>
        </div>

        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-xs sm:text-sm text-muted-foreground">
            AI-powered task assistance is now available! Get help prioritizing, suggestions for new tasks, and productivity tips.
          </p>
        </div>

        <AIResponseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={dialogTitle}
          response={aiResponse}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};