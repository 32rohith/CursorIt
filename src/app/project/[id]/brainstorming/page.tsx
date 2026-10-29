"use client";
import React, { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import ProjectLayout from "@/components/layouts/ProjectLayout";

export default function BrainstormingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const [initialContent, setInitialContent] = useState<string>("");

  return (
    <ProjectLayout projectId={projectId} transparentBg>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-transparent text-white overflow-hidden">
        {/* Background lights */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-visible">
          <div
            className="absolute -top-[600px] left-0 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen"
            style={{
              background:
                "radial-gradient(42% 52% at 65% 15%, #7b22ab 0%, rgba(123,34,171,0) 100%)",
            }}
          />
          <div
            className="absolute -top-[600px] left-1/2 -translate-x-1/2 w-full h-[1600px] opacity-70 blur-3xl mix-blend-screen"
            style={{
              background:
                "radial-gradient(39% 48% at 44.5% 15.4%, #4594f0 0%, rgba(69,148,240,0) 100%)",
            }}
          />
        </div>
        <AnimatedAIChat 
            projectId={projectId}
            initialContent={initialContent}
        />
      </div>
    </ProjectLayout>
  );
} 