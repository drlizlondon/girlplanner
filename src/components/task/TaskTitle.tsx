
import { useState } from "react";

interface TaskTitleProps {
  title: string;
  onUpdate: (title: string) => void;
}

export const TaskTitle = ({ title, onUpdate }: TaskTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return isEditing ? (
    <input
      type="text"
      value={title}
      onChange={(e) => onUpdate(e.target.value)}
      className="w-full border border-input rounded bg-background text-foreground px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
      onBlur={toggleEdit}
    />
  ) : (
    <span 
      className="font-normal truncate max-w-[200px] cursor-pointer text-foreground hover:text-purple-600 dark:hover:text-purple-400"
      onClick={toggleEdit}
    >
      {title}
    </span>
  );
};
