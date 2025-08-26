import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  response: string;
  isLoading: boolean;
}

export const AIResponseDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  response, 
  isLoading 
}: AIResponseDialogProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      toast({
        title: "Copied!",
        description: "AI response copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <div className="flex gap-2">
            {response && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          ) : response ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {response}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No response available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};