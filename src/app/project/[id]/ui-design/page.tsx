"use client";

import React, { use } from "react";
import ProjectLayout from "@/components/layouts/ProjectLayout";
import UIDesignClient from "@/components/design/UIDesignClient";

export default function UIDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const handleComplete = () => {
    window.location.href = `/project/${projectId}/docs`;
  };

  return (
    <ProjectLayout projectId={projectId}>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden py-10">
        {/* Background lights */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-visible">
          <div className="absolute -top-[600px] left-0 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen" style={{ background: "radial-gradient(42% 52% at 65% 15%, #7b22ab 0%, rgba(123,34,171,0) 100%)" }} />
          <div className="absolute -top-[600px] left-1/2 -translate-x-1/2 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen" style={{ background: "radial-gradient(39% 48% at 44.5% 15.4%, #4594f0 0%, rgba(69,148,240,0) 100%)" }} />
        </div>

        <div className="relative w-full max-w-7xl p-8 rounded-2xl bg-white/2 backdrop-blur-md border border-white/10 shadow-lg">
          <UIDesignClient projectId={projectId} onComplete={handleComplete} />
        </div>
      </div>
    </ProjectLayout>
  );
} 