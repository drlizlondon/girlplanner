
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

interface TaskCheckmarkProps {
  completed: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const TaskCheckmark = ({ completed, onCheckedChange }: TaskCheckmarkProps) => {
  return (
    <div className="relative flex items-center">
      <Checkbox
        checked={completed}
        onCheckedChange={onCheckedChange}
        className="transition-all duration-200 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
      />
      {completed && (
        <span className="absolute left-full ml-2 text-sm text-green-600 font-medium flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Done!
        </span>
      )}
    </div>
  );
};
