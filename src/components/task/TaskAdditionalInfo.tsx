
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface TaskAdditionalInfoProps {
  taskId: string;
  additionalInfo: string;
  onUpdate: (info: string) => void;
}

export const TaskAdditionalInfo = ({ taskId, additionalInfo, onUpdate }: TaskAdditionalInfoProps) => {
  const { toast } = useToast();
  const [localInfo, setLocalInfo] = useState(additionalInfo);

  const handleSave = () => {
    onUpdate(localInfo);
    toast({
      title: "Changes saved",
      description: "Your notes have been updated.",
    });
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <Textarea
            placeholder="Additional information..."
            value={localInfo}
            onChange={(e) => setLocalInfo(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
