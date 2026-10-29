"use client";
import React from "react";
import { Phase, getPhaseIndex } from "@/lib/phases";

interface Props {
  required: Phase;
  current: Phase | null | undefined;
  children: React.ReactNode;
}

const PhaseGate: React.FC<Props> = ({ required, current, children }) => {
  const allowed = getPhaseIndex(current) >= getPhaseIndex(required);
  if (allowed) return <>{children}</>;
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/70 flex items-center justify-center z-50">
        <div className="text-center text-white space-y-2">
          <h2 className="text-xl font-semibold">Step Locked</h2>
          <p className="text-sm text-gray-300">Please finish previous steps before continuing.</p>
        </div>
      </div>
    </div>
  );
};

export default PhaseGate; 