import React from "react";
// Removed framer-motion; use CSS hover animation instead
// Badge import removed; not used currently
import { Clock } from "lucide-react";

export type TaskPriority = "High" | "Medium" | "Low";

export interface TaskCardProps {
  title: string;
  progress: number; // 0-100
  priority: TaskPriority;
  daysLeft: number; // remaining days ("0" for today)
}

const priorityColor = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-green-500 text-black",
};

export const TaskCard: React.FC<TaskCardProps> = ({ title, progress, priority, daysLeft }) => {
  return (
    <div
      className="relative rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-4 flex flex-col gap-4 shadow-md transform transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[priority]}`}>{priority}</span>
        <button className="text-white/60 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75z"
            />
          </svg>
        </button>
      </div>

      <p className="text-sm text-white/90 leading-snug flex-grow">{title}</p>

      <div className="space-y-2">
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white/80"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>{progress}%</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {daysLeft === 0 ? "0d" : `${daysLeft}d`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 