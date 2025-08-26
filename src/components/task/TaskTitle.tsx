
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
      className="w-full border rounded px-2 py-1"
      onBlur={toggleEdit}
    />
  ) : (
    <span 
      className="font-normal truncate max-w-[200px] cursor-pointer hover:text-purple-600"
      onClick={toggleEdit}
    >
      {title}
    </span>
  );
};
