
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface TaskDueDateProps {
  dueDate?: Date;
  onUpdate: (date: Date | undefined) => void;
}

export const TaskDueDate = ({ dueDate, onUpdate }: TaskDueDateProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[140px] justify-start text-left font-normal ${!dueDate ? 'text-gray-500' : ''}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dueDate ? (
            format(dueDate, "MM/dd/yy")
          ) : (
            <span>Set due date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dueDate}
          onSelect={(date) => {
            onUpdate(date);
            setIsCalendarOpen(false);
          }}
          initialFocus
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
};
