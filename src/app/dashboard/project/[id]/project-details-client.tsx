"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight } from "lucide-react";

// Define project steps in order
const PROJECT_STEPS = [
  { key: 'platform', label: 'Platform', route: 'platform' },
  { key: 'brainstorming', label: 'Brainstorming', route: 'brainstorming' },
  { key: 'tech_stack', label: 'Tech Stack', route: 'tech-stack' },
  { key: 'flowchart', label: 'Flowchart', route: 'flowchart' },
  { key: 'ui_design', label: 'UI Design', route: 'ui-design' },
  { key: 'docs', label: 'Docs', route: 'docs' },
  { key: 'complete', label: 'Complete', route: 'complete' },
];

interface ProjectDetailsProps {
  project: any;
  id: string;
}

export default function ProjectDetails({ project, id }: ProjectDetailsProps) {
  const router = useRouter();
  const projectId = id;
  
  // Calculate the current step index and next step
  const currentStepIndex = PROJECT_STEPS.findIndex(step => step.key === project?.status);
  const nextStep = PROJECT_STEPS[currentStepIndex + 1];

  // Calculate progress percentage
  const progress = Math.max(
    5,
    Math.min(
      100,
      Math.round((currentStepIndex / (PROJECT_STEPS.length - 1)) * 100)
    )
  );

  const handleContinue = () => {
    if (project?.status) {
      const currentStep = PROJECT_STEPS.find(step => step.key === project.status);
      if (currentStep) {
        router.push(`/project/${projectId}/${currentStep.route}`);
      }
    }
  };

  const handleNavigateToStep = (stepRoute: string) => {
    router.push(`/project/${projectId}/${stepRoute}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Project header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Project Details</span>
          </div>

          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Button onClick={handleContinue}>
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {project.description && (
            <p className="text-white/70">{project.description}</p>
          )}
          
          {project.platform && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs bg-white/10 text-white/90">
              {project.platform} Application
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">Progress</span>
            <span className="text-white/90">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
          <div className="space-y-4">
            {PROJECT_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div 
                  key={step.key}
                  className={`flex items-center p-4 rounded-lg border ${
                    isCurrent 
                      ? 'bg-white/5 border-white/20' 
                      : isCompleted 
                        ? 'bg-white/5 border-green-500/20' 
                        : 'bg-white/5 border-white/10'
                  }`}
                >
                  {/* Status indicator */}
                  <div 
                    className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 ${
                      isCompleted 
                        ? 'bg-green-500/20 text-green-500' 
                        : isCurrent 
                          ? 'bg-blue-500/20 text-blue-500 animate-pulse' 
                          : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  
                  {/* Step info */}
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      isCurrent ? 'text-white' : isCompleted ? 'text-white/90' : 'text-white/50'
                    }`}>
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <p className="text-white/60 text-sm mt-1">In progress</p>
                    )}
                  </div>
                  
                  {/* Action button */}
                  <Button 
                    variant={isCompleted || isCurrent ? "default" : "ghost"}
                    size="sm"
                    disabled={!isCompleted && !isCurrent}
                    onClick={() => handleNavigateToStep(step.route)}
                    className={!isCompleted && !isCurrent ? 'opacity-50' : ''}
                  >
                    {isCompleted ? 'View' : isCurrent ? 'Continue' : 'Locked'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project data preview (will show different content based on progress) */}
        {currentStepIndex > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Project Data</h2>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              {project.platform && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white/70 mb-1">Platform</h3>
                  <p className="text-white">{project.platform}</p>
                </div>
              )}
              
              {project.brainstorming_context && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white/70 mb-1">Brainstorming Notes</h3>
                  <div className="bg-white/5 rounded-lg p-3 text-sm">
                    <pre className="whitespace-pre-wrap font-mono text-white/80 text-xs">
                      {typeof project.brainstorming_context === 'string' 
                        ? project.brainstorming_context 
                        : JSON.stringify(project.brainstorming_context, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {project.tech_stack && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-white/70 mb-1">Tech Stack</h3>
                  <div className="bg-white/5 rounded-lg p-3 text-sm">
                    <pre className="whitespace-pre-wrap font-mono text-white/80 text-xs">
                      {typeof project.tech_stack === 'string' 
                        ? project.tech_stack 
                        : JSON.stringify(project.tech_stack, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 