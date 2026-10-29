import React from "react";
import { TaskCard, TaskCardProps } from "./TaskCard";

export interface TaskColumnProps {
  title: string;
  tasks: TaskCardProps[];
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ title, tasks }) => {
  return (
    <div className="space-y-4 min-w-[260px] w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-semibold text-sm tracking-wide uppercase">
          {title}
        </h2>
        <span className="text-xs text-white/50">{tasks.length}</span>
      </div>
      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <TaskCard key={`${task.title}-${idx}`} {...task} />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn; 