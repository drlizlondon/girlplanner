
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { localStorageAPI } from "@/lib/localStorage";

interface TaskType {
  id: string;
  value: string;
}

interface TaskTypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const TaskTypeSelect = ({ value, onValueChange }: TaskTypeSelectProps) => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);

  useEffect(() => {
    const fetchTaskTypes = () => {
      const data = localStorageAPI.getTaskTypes();
      setTaskTypes(data);
    };

    fetchTaskTypes();
  }, []);

  const renderTypeValue = (type: string) => {
    if (type === "_none" || !type) {
      return "-";
    }
    return type;
  };

  return (
    <Select value={value || "_none"} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_none">
          <span className="text-gray-400 italic">-</span>
        </SelectItem>
        {taskTypes.map((type) => (
          type.value !== '_none' && (
            <SelectItem key={type.id} value={type.value}>
              {type.value}
            </SelectItem>
          )
        ))}
      </SelectContent>
    </Select>
  );
};
