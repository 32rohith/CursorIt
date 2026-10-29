import React from "react";
import { CheckCircle, PlusCircle, RefreshCw, Layers } from "lucide-react";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  subtext: string;
}

const stats: StatItem[] = [
  {
    icon: <Layers className="w-4 h-4" />,
    label: "44 Projects",
    subtext: "In the last 14 days",
  },
  {
    icon: <CheckCircle className="w-4 h-4" />,
    label: "10 Done",
    subtext: "In the last 10 days",
  },
  {
    icon: <RefreshCw className="w-4 h-4" />,
    label: "8 Updated",
    subtext: "In the last 5 days",
  },
  {
    icon: <PlusCircle className="w-4 h-4" />,
    label: "6 New",
    subtext: "Waiting approval",
  },
];

export const StatsPanel: React.FC = () => {
  return (
    <aside className="w-72 flex-shrink-0 space-y-8">
      <div className="space-y-6 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6">
        <h3 className="text-sm font-semibold text-white">Active Tasks</h3>
        <ul className="space-y-4">
          {stats.map((s) => (
            <li key={s.label} className="flex items-start gap-3">
              <div className="text-white/70 mt-0.5">{s.icon}</div>
              <div>
                <p className="text-sm text-white font-medium leading-none">
                  {s.label}
                </p>
                <p className="text-xs text-white/50 mt-0.5">{s.subtext}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Progress gauge */}
      <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6 flex flex-col items-center gap-4">
        <h3 className="text-sm font-semibold text-white">Tasks Progress</h3>
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${0.5 * 2 * Math.PI * 54} ${2 * Math.PI * 54}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">
            50%
          </span>
        </div>
        <div className="text-xs text-center text-white/60">
          <p>Scope: 10%</p>
          <p>Started: 20%</p>
          <p>Done: 20%</p>
        </div>
      </div>
    </aside>
  );
};

export default StatsPanel; 