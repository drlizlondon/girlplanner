import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lightbulb, Target, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";

interface AITaskHelperProps {
  tasks: Task[];
}

export const AITaskHelper = ({ tasks }: AITaskHelperProps) => {
  const { toast } = useToast();

  const handleAIClick = () => {
    toast({
      title: "AI Feature Coming Soon",
      description: "AI task assistance will be available in future versions. For now, focus on organizing your tasks manually!",
      variant: "default",
    });
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
            onClick={handleAIClick}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm p-2 sm:p-3"
          >
            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Prioritize Tasks</span>
            <span className="sm:hidden">Prioritize</span>
          </Button>
          
          <Button
            onClick={handleAIClick}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm p-2 sm:p-3"
          >
            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Suggest Tasks</span>
            <span className="sm:hidden">Suggest</span>
          </Button>
          
          <Button
            onClick={handleAIClick}
            variant="outline"
            className="flex items-center gap-2 text-xs sm:text-sm p-2 sm:p-3 sm:col-span-2 lg:col-span-1"
          >
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Get Help</span>
            <span className="sm:hidden">Help</span>
          </Button>
        </div>

        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-xs sm:text-sm text-muted-foreground">
            AI features coming soon! This will help you prioritize tasks, suggest new ones, and provide assistance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};