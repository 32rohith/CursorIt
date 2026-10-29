"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  Layers,
  Terminal,
  Cpu,
  ListChecks,
  Download,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Database,
  Shield,
  Loader2,
  Code2,
  FolderTree,
  FileCode2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import ProjectLayout from "@/components/layouts/ProjectLayout";

interface PRDRequirement {
  id: string;
  title: string;
  userStory?: string;
  description: string;
  acceptanceCriteria: string[];
}

interface PRDData {
  title: string;
  executiveSummary: string;
  targetAudience: string;
  problemStatement: string;
  functionalRequirements: PRDRequirement[];
  nonFunctionalRequirements: string[];
  outOfScope: string[];
}

interface ArchitectureData {
  title: string;
  pattern: string;
  directoryStructure?: string;
  frontend: string;
  backend: string;
  database: string;
  security: string;
}

interface TypeDefinitionsData {
  title: string;
  code: string;
}

interface DatabaseTable {
  name: string;
  description: string;
  columns: { name: string; type: string; description: string }[];
  rlsPolicies: string[];
}

interface DatabaseSchemaData {
  title: string;
  sql?: string;
  tables: DatabaseTable[];
}

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  authRequired?: boolean;
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  successResponse?: string;
  errorResponses?: { status: number; message: string }[];
}

interface ApiSpecificationData {
  title: string;
  endpoints: ApiEndpoint[];
}

interface PhasePrompt {
  phaseName: string;
  prompt: string;
}

interface AiPromptData {
  title: string;
  description: string;
  content: string;
  promptsByPhase?: PhasePrompt[];
}

interface RoadmapPhase {
  phase: string;
  tasks: string[];
}

interface ImplementationRoadmapData {
  title: string;
  phases: RoadmapPhase[];
}

interface DocsData {
  prd?: PRDData;
  architecture?: ArchitectureData;
  typeDefinitions?: TypeDefinitionsData;
  databaseSchema?: DatabaseSchemaData;
  apiSpecification?: ApiSpecificationData;
  aiPrompt?: AiPromptData;
  implementationRoadmap?: ImplementationRoadmapData;
  fullMarkdown?: string;
}

export default function DocsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [projectName, setProjectName] = useState<string>("Project");
  const [docs, setDocs] = useState<DocsData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "prd" | "architecture" | "types" | "db-api" | "ai-prompt" | "roadmap" | "markdown"
  >("prd");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Load project details and existing documentation
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const { data: project, error: projErr } = await supabase
          .from("projects")
          .select("name, docs, documentation, brainstorming_context")
          .eq("id", projectId)
          .single();

        if (projErr) throw projErr;

        if (isMounted && project) {
          if (project.name) setProjectName(project.name);

          const existingDocs =
            project.docs ||
            project.documentation ||
            project.brainstorming_context?.docs ||
            project.brainstorming_context?.documentation;
          if (existingDocs) {
            setDocs(existingDocs);
          }
        }
      } catch (err: unknown) {
        console.error("Error loading docs:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Generate documentation via AI
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Failed to generate docs" }));
        throw new Error(errData.error || "Generation request failed");
      }

      const data = await res.json();
      const generatedDocs = data.docs || data.documentation;
      if (generatedDocs) {
        setDocs(generatedDocs);
        setActiveTab("prd");
      } else {
        throw new Error("No documentation received from server");
      }
    } catch (err: unknown) {
      console.error("Error generating docs:", err);
      setError(err instanceof Error ? err.message : "Failed to generate docs. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy helper
  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download File helper
  const handleDownload = (content: string, filename: string, mimeType = "text/markdown;charset=utf-8;") => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Complete Project and redirect
  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({ status: "complete" })
        .eq("id", projectId);

      if (updateError) {
        throw updateError;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Error completing project:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
      setIsCompleting(false);
    }
  };

  const safeFileName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <ProjectLayout projectId={projectId}>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-black text-white px-4 py-8 sm:px-8">
        {/* Ambient Gradient Glows */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute -top-[300px] left-1/4 w-[850px] h-[850px] opacity-30 blur-[150px] rounded-full"
            style={{ background: "radial-gradient(circle, #7928ca 0%, rgba(121,40,202,0) 70%)" }}
          />
          <div
            className="absolute -top-[200px] right-1/4 w-[750px] h-[750px] opacity-25 blur-[150px] rounded-full"
            style={{ background: "radial-gradient(circle, #0070f3 0%, rgba(0,112,243,0) 70%)" }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Phase 6 — Token-Optimized Project Docs & PRD
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Project Docs</h1>
              <p className="text-white/60 text-sm sm:text-base mt-1">
                Exhaustive specifications, database DDL, and token-optimized AI coding prompts to build with zero waste.
              </p>
            </div>

            {/* Quick Action Tools */}
            {docs && (
              <div className="flex items-center gap-2 flex-wrap">
                {docs.aiPrompt?.content && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(docs.aiPrompt!.content, "prompt")}
                    className="bg-purple-500/15 border-purple-500/30 text-purple-200 hover:bg-purple-500/25"
                  >
                    {copiedType === "prompt" ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> AI Rules Copied
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 mr-1.5 text-purple-400" /> Copy AI Prompt
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(docs.fullMarkdown || JSON.stringify(docs, null, 2), "markdown")}
                  className="bg-white/5 border-white/15 text-white hover:bg-white/10"
                >
                  {copiedType === "markdown" ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> Copied .md
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" /> Copy Markdown
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(docs.fullMarkdown || JSON.stringify(docs, null, 2), `${safeFileName}-docs.md`)}
                  className="bg-white/5 border-white/15 text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-1.5" /> Export Docs (.md)
                </Button>
                {docs.aiPrompt?.content && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(docs.aiPrompt!.content, `.cursorrules`)}
                    className="bg-white/5 border-white/15 text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-1.5" /> .cursorrules
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="bg-white/5 border-white/15 text-white hover:bg-white/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-1.5 ${isGenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-purple-400 mb-4" />
              <p className="text-white/70">Loading project docs...</p>
            </div>
          )}

          {/* State 1: Docs NOT yet generated */}
          {!isLoading && !docs && (
            <div className="p-8 sm:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center shadow-2xl">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Generate Exhaustive Project Docs & PRD</h2>
              <p className="max-w-2xl mx-auto text-white/70 text-sm sm:text-base mb-8">
                Compile your project brief, chosen tech stack, architecture flowchart, and UI design tokens into
                an unambiguous PRD and token-optimized AI coding instructions for Cursor, Claude Code, and Copilot.
              </p>

              {/* Deliverables Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10 text-left">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <FileText className="w-5 h-5 text-purple-400 mb-2" />
                  <h4 className="font-semibold text-sm text-white">Full PRD Document</h4>
                  <p className="text-xs text-white/60 mt-1">User stories, acceptance criteria, edge cases, and out-of-scope boundaries.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Layers className="w-5 h-5 text-blue-400 mb-2" />
                  <h4 className="font-semibold text-sm text-white">Architecture & Directory Tree</h4>
                  <p className="text-xs text-white/60 mt-1">Explicit folder layout, component boundaries, and state flow.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Cpu className="w-5 h-5 text-emerald-400 mb-2" />
                  <h4 className="font-semibold text-sm text-white">Token-Optimized AI Prompt</h4>
                  <p className="text-xs text-white/60 mt-1">High-density .cursorrules and modular phase prompts to minimize token usage.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Database className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="font-semibold text-sm text-white">PostgreSQL DDL & RLS</h4>
                  <p className="text-xs text-white/60 mt-1">Ready-to-run SQL schema with primary keys, indexes, and security policies.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <FileCode2 className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="font-semibold text-sm text-white">TypeScript Data Contracts</h4>
                  <p className="text-xs text-white/60 mt-1">Complete interfaces for models, API requests, and responses.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <ListChecks className="w-5 h-5 text-indigo-400 mb-2" />
                  <h4 className="font-semibold text-sm text-white">Modular Phase Prompts</h4>
                  <p className="text-xs text-white/60 mt-1">Step-by-step copyable prompts for each phase without resending entire specs.</p>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                size="lg"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="px-8 py-6 text-base font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-xl shadow-purple-600/30 transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Generating Detailed PRD & AI Specifications...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Complete PRD & Token-Optimized Docs
                  </>
                )}
              </Button>
            </div>
          )}

          {/* State 2: Docs Generated & Loaded */}
          {!isLoading && docs && (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveTab("prd")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    activeTab === "prd"
                      ? "bg-white/15 text-white shadow-sm border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  PRD (Requirements)
                </button>
                <button
                  onClick={() => setActiveTab("architecture")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    activeTab === "architecture"
                      ? "bg-white/15 text-white shadow-sm border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  Architecture
                </button>
                <button
                  onClick={() => setActiveTab("types")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    activeTab === "types"
                      ? "bg-white/15 text-white shadow-sm border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-cyan-400" />
                  TypeScript Contracts
                </button>
                <button
                  onClick={() => setActiveTab("db-api")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    activeTab === "db-api"
                      ? "bg-white/15 text-white shadow-sm border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  Database & API Spec
                </button>
                <button
                  onClick={() => setActiveTab("ai-prompt")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    activeTab === "ai-prompt"
                      ? "bg-purple-500/25 text-purple-200 shadow-sm border border-purple-500/40"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Token-Optimized AI Prompt
                </button>
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    activeTab === "roadmap"
                      ? "bg-white/15 text-white shadow-sm border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ListChecks className="w-4 h-4 text-indigo-400" />
                  Implementation Checklist
                </button>
                <button
                  onClick={() => setActiveTab("markdown")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                    activeTab === "markdown"
                      ? "bg-white/15 text-white shadow-sm border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Code2 className="w-4 h-4 text-zinc-400" />
                  Full Markdown
                </button>
              </div>

              {/* Tab 1: PRD */}
              {activeTab === "prd" && docs.prd && (
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      {docs.prd.title || "Product Requirements Document (PRD)"}
                    </h3>
                    <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                      {docs.prd.executiveSummary}
                    </p>
                  </div>

                  {/* Problem & Audience Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                        Problem Statement
                      </h4>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {docs.prd.problemStatement}
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                        Target Audience & Personas
                      </h4>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {docs.prd.targetAudience}
                      </p>
                    </div>
                  </div>

                  {/* Functional Requirements */}
                  {docs.prd.functionalRequirements && docs.prd.functionalRequirements.length > 0 && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h4 className="text-base font-semibold text-purple-300 uppercase tracking-wider">
                        Functional Requirements & User Stories
                      </h4>
                      <div className="space-y-4">
                        {docs.prd.functionalRequirements.map((req, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {req.id || `FR-${idx + 1}`}
                              </span>
                              <h5 className="font-semibold text-white text-sm">{req.title}</h5>
                            </div>
                            {req.userStory && (
                              <p className="text-xs text-purple-200/90 italic bg-purple-500/10 p-2 rounded border border-purple-500/20">
                                💬 {req.userStory}
                              </p>
                            )}
                            <p className="text-xs text-white/70 leading-relaxed">{req.description}</p>
                            {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                <span className="text-xs text-white/50 block font-medium">Acceptance Criteria:</span>
                                {req.acceptanceCriteria.map((c, cIdx) => (
                                  <div key={cIdx} className="flex items-start gap-2 text-xs text-white/80">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{c}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Non-Functional & Out of Scope */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {docs.prd.nonFunctionalRequirements && (
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <h4 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">
                          Non-Functional Requirements
                        </h4>
                        <ul className="space-y-2">
                          {docs.prd.nonFunctionalRequirements.map((nfr, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-white/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{nfr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {docs.prd.outOfScope && (
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <h4 className="text-sm font-semibold text-rose-300 uppercase tracking-wider">
                          Out of Scope (v1 Boundaries)
                        </h4>
                        <ul className="space-y-2">
                          {docs.prd.outOfScope.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-white/70">
                              <span className="text-rose-400 font-bold shrink-0">✕</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Architecture */}
              {activeTab === "architecture" && docs.architecture && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-400" />
                      {docs.architecture.title || "System Architecture & Engineering Specification"}
                    </h3>
                    {docs.architecture.pattern && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {docs.architecture.pattern}
                      </span>
                    )}
                  </div>

                  {docs.architecture.directoryStructure && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                        <FolderTree className="w-4 h-4" /> Standardized Directory Structure
                      </div>
                      <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-200/90 whitespace-pre leading-relaxed overflow-x-auto">
                        {docs.architecture.directoryStructure}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                        <Terminal className="w-4 h-4" /> Frontend Architecture
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{docs.architecture.frontend}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                        <Cpu className="w-4 h-4" /> Backend & Serverless Handlers
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{docs.architecture.backend}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <Database className="w-4 h-4" /> Database & Storage Topology
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{docs.architecture.database}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                        <Shield className="w-4 h-4" /> Security & Row-Level Security (RLS)
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{docs.architecture.security}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: TypeScript Contracts */}
              {activeTab === "types" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileCode2 className="w-5 h-5 text-cyan-400" />
                        {docs.typeDefinitions?.title || "TypeScript Data Contracts & Interfaces"}
                      </h3>
                      {docs.typeDefinitions?.code && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(docs.typeDefinitions!.code, "typesCopy")}
                          className="text-xs bg-white/5 border-white/10 hover:bg-white/10"
                        >
                          {copiedType === "typesCopy" ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied Types
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" /> Copy Types (.ts)
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-white/60">
                      Copy these contracts directly into <code className="text-cyan-300">src/types/</code> to ensure zero
                      type ambiguity for coding assistants.
                    </p>
                    <pre className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-cyan-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px] scrollbar-thin">
                      {docs.typeDefinitions?.code || "// TypeScript interfaces generated with schema"}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 4: Database & API Spec */}
              {activeTab === "db-api" && (
                <div className="space-y-6">
                  {/* Database Tables */}
                  {docs.databaseSchema?.tables && docs.databaseSchema.tables.length > 0 && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Database className="w-5 h-5 text-emerald-400" />
                          Database Entity Models & RLS
                        </h3>
                        {docs.databaseSchema.sql && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(docs.databaseSchema!.sql!, "sql")}
                            className="text-xs bg-white/5 border-white/10 hover:bg-white/10"
                          >
                            {copiedType === "sql" ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            Copy DDL SQL
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {docs.databaseSchema.tables.map((tbl, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-semibold text-emerald-300">
                                {tbl.name}
                              </span>
                              <span className="text-xs text-white/50">{tbl.description}</span>
                            </div>

                            {tbl.columns && tbl.columns.length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-white/10 text-white/50">
                                      <th className="pb-2 font-medium">Column</th>
                                      <th className="pb-2 font-medium">Type</th>
                                      <th className="pb-2 font-medium">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5 text-white/80">
                                    {tbl.columns.map((c, cIdx) => (
                                      <tr key={cIdx}>
                                        <td className="py-2 font-mono text-white/90">{c.name}</td>
                                        <td className="py-2 font-mono text-purple-300">{c.type}</td>
                                        <td className="py-2 text-white/60">{c.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {tbl.rlsPolicies && tbl.rlsPolicies.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/5">
                                <span className="text-xs text-rose-300 font-semibold block mb-1">
                                  Row-Level Security Policies:
                                </span>
                                <ul className="space-y-1">
                                  {tbl.rlsPolicies.map((p, pIdx) => (
                                    <li key={pIdx} className="text-xs text-white/70 font-mono">
                                      • {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {docs.databaseSchema.sql && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                          <span className="text-xs font-semibold text-emerald-300">Executable PostgreSQL DDL Script:</span>
                          <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[300px] scrollbar-thin">
                            {docs.databaseSchema.sql}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* API Endpoints */}
                  {docs.apiSpecification?.endpoints && docs.apiSpecification.endpoints.length > 0 && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-blue-400" />
                        API Specification & Route Handlers
                      </h3>
                      <div className="space-y-4">
                        {docs.apiSpecification.endpoints.map((ep, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                                  ep.method === "GET"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : ep.method === "POST"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : ep.method === "DELETE"
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {ep.method}
                              </span>
                              <span className="font-mono text-sm text-white font-medium">{ep.path}</span>
                              {ep.authRequired && (
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                                  Auth Required
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/70">{ep.description}</p>

                            {ep.requestBody && ep.requestBody !== "None" && (
                              <div className="p-2.5 rounded bg-black/50 border border-white/5 font-mono text-xs text-zinc-300">
                                <span className="text-white/40 block mb-1">Request Payload:</span>
                                {ep.requestBody}
                              </div>
                            )}

                            {ep.successResponse && (
                              <div className="p-2.5 rounded bg-black/50 border border-white/5 font-mono text-xs text-emerald-300/90">
                                <span className="text-white/40 block mb-1">Success Response (200):</span>
                                {ep.successResponse}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Token-Optimized AI Prompt & Modular Prompts */}
              {activeTab === "ai-prompt" && docs.aiPrompt && (
                <div className="space-y-6">
                  {/* Master Prompt Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-blue-950/40 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">{docs.aiPrompt.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCopy(docs.aiPrompt!.content, "promptTab")}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/30"
                        >
                          {copiedType === "promptTab" ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" /> Copy .cursorrules
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(docs.aiPrompt!.content, ".cursorrules")}
                          className="bg-white/5 border-white/10 text-xs text-white hover:bg-white/10"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Download .cursorrules
                        </Button>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                      {docs.aiPrompt.description}
                    </p>
                  </div>

                  {/* Prompt Text Box */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <pre className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-purple-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[400px] scrollbar-thin">
                      {docs.aiPrompt.content}
                    </pre>
                  </div>

                  {/* Modular Prompts by Phase */}
                  {docs.aiPrompt.promptsByPhase && docs.aiPrompt.promptsByPhase.length > 0 && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <ListChecks className="w-5 h-5 text-emerald-400" />
                          Modular Phase Prompts (Copy Directly Into AI Assistant)
                        </h4>
                        <p className="text-xs text-white/60 mt-1">
                          Instead of re-feeding the entire project document every time, copy these self-contained
                          atomic prompts phase-by-phase into Cursor, Claude Code, or Copilot to save up to 80% on tokens.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {docs.aiPrompt.promptsByPhase.map((p, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-semibold text-sm text-purple-300">
                                {p.phaseName}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(p.prompt, `phasePrompt-${idx}`)}
                                className="text-xs bg-white/5 border-white/10 hover:bg-white/10"
                              >
                                {copiedType === `phasePrompt-${idx}` ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied Phase Prompt
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Prompt
                                  </>
                                )}
                              </Button>
                            </div>
                            <pre className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                              {p.prompt}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Implementation Roadmap */}
              {activeTab === "roadmap" && docs.implementationRoadmap && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-indigo-400" />
                      {docs.implementationRoadmap.title || "Step-by-Step Implementation Roadmap"}
                    </h3>
                    <p className="text-xs text-white/60">
                      Phased engineering tasks to execute with your AI pair programmer with zero context drift.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {docs.implementationRoadmap.phases.map((ph, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-white text-sm">{ph.phase}</h4>
                        </div>
                        <ul className="space-y-2 pl-10">
                          {ph.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2 text-xs text-white/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: Full Markdown */}
              {activeTab === "markdown" && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Full Markdown Document Bundle
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(docs.fullMarkdown || JSON.stringify(docs, null, 2), "mdTab")}
                      className="bg-white/5 border-white/15 text-white hover:bg-white/10"
                    >
                      {copiedType === "mdTab" ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy Markdown
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white/80 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px] scrollbar-thin">
                    {docs.fullMarkdown || JSON.stringify(docs, null, 2)}
                  </pre>
                </div>
              )}

              {/* Completion Banner & Action */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-blue-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Project Planning Complete</h4>
                    <p className="text-xs text-white/60">
                      Your full PRD, architecture, schemas, and token-optimized AI prompts are saved to docs.
                    </p>
                  </div>
                </div>

                <Button
                  size="lg"
                  disabled={isCompleting}
                  onClick={handleComplete}
                  className="w-full sm:w-auto px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/25 transition-all"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...
                    </>
                  ) : (
                    <>
                      Complete Project <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProjectLayout>
  );
}
