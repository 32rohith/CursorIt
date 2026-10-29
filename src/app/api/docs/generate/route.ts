import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { chatWithGemini, ChatMessage } from "@/lib/ai/gemini";

const SYSTEM_PROMPT = `AI Persona: Act as a Principal Systems Architect & AI Prompt Optimization Specialist.

System Prompt:
You are an elite Principal Systems Architect & AI Prompt Optimization Specialist. Your objective is to take an application's upstream decisions (Project Brief, Tech Stack, Flowchart/Architecture, and UI Design System) and generate an exhaustive, developer-ready technical specification and token-optimized AI coding instructions.

CRITICAL DIRECTIVE ON DETAIL & TOKEN EFFICIENCY:
When human developers use AI coding assistants (Cursor, Claude Code, GitHub Copilot, Windsurf, Antigravity):
- Vague specifications force the AI assistant to guess, hallucinate, ask questions, or write code that needs repeated refactoring—burning thousands of tokens per session.
- By contrast, EXHAUSTIVE, UNAMBIGUOUS, CONCRETE specifications (exact TypeScript interfaces, full PostgreSQL DDL with RLS, exact API request/response shapes, exact folder trees, and pre-packaged modular phase prompts) allow an AI coding assistant to implement features on the FIRST attempt with minimal token burn.

RULES:
1. NO PLACEHOLDERS: Do not write "...", "[Insert here]", or generic placeholders. Every item must be fully fleshed out specifically for the project.
2. CONCRETE DDL: The SQL field must be complete, copy-pasteable PostgreSQL DDL including tables, columns with constraints, foreign keys, triggers, and Supabase Row-Level Security (RLS) policies.
3. CONCRETE TYPES: Provide complete TypeScript interfaces for database records, API requests, and API responses.
4. TOKEN-OPTIMIZED MASTER PROMPT: The 'aiPrompt' must be a production-ready '.cursorrules' / 'AGENT_INSTRUCTIONS.md' file that gives any coding agent total clarity with zero fluff.
5. ATOMIC PHASE PROMPTS: Provide self-contained copy-paste prompts for each development phase so developers never need to re-feed the entire context to their AI assistant.

Your entire output must be a single, valid JSON object with EXACTLY the following structure (do not wrap in markdown code fences):
{
  "prd": {
    "title": "Product Requirements Document (PRD)",
    "executiveSummary": "Comprehensive, high-density description of the application, problem space, value proposition, and expected impact.",
    "targetAudience": "Detailed user personas with specific pain points, technical proficiency, and primary goals.",
    "problemStatement": "Exact breakdown of current market/user deficiencies that this application solves.",
    "functionalRequirements": [
      {
        "id": "FR-1",
        "title": "Specific Feature Name",
        "userStory": "As a [user persona], I want to [action] so that [benefit].",
        "description": "Comprehensive explanation of feature behavior, states, and user interactions.",
        "acceptanceCriteria": [
          "Given [precondition], when [action], then [outcome]",
          "Given [edge case], when [action], then [error handling]"
        ]
      }
    ],
    "nonFunctionalRequirements": [
      "Latency: Sub-200ms TTFB for API endpoints and sub-1.5s LCP on mobile connections",
      "Scalability: Stateless serverless handlers with indexed PostgreSQL queries",
      "Security: OWASP Top 10 compliance, strict Supabase RLS, sanitized inputs, and CSRF protection",
      "Accessibility: Full WCAG 2.1 AA compliance with keyboard navigation and ARIA landmarks"
    ],
    "outOfScope": [
      "Specific feature or integration explicitly excluded from v1 to prevent scope creep and token waste."
    ]
  },
  "architecture": {
    "title": "System Architecture & Engineering Specification",
    "pattern": "Specific architectural pattern (e.g. Next.js 15 App Router with React Server Components, Supabase PostgreSQL BaaS, Serverless Edge Handlers).",
    "directoryStructure": "Full ASCII directory tree showing exact locations of components, lib, hooks, types, and route handlers.",
    "frontend": "Complete frontend design: component hierarchy, client vs server component boundaries, state management strategy, and styling conventions.",
    "backend": "Serverless API route conventions, request validation schemas, authentication session handling via SSR middleware, and business logic.",
    "database": "PostgreSQL database topology, connection pooling, relational integrity, indexing strategy, and RLS enforcement.",
    "security": "Authentication lifecycles, JWT session refresh via middleware, RLS policies, input sanitization, and secret management."
  },
  "typeDefinitions": {
    "title": "TypeScript Data Contracts & Interfaces",
    "code": "// Complete copy-pasteable TypeScript types and interfaces for the entire project\\nexport interface ..."
  },
  "databaseSchema": {
    "title": "PostgreSQL Schema DDL & Row-Level Security",
    "sql": "-- Complete, executable PostgreSQL DDL script with tables, constraints, indexes, and RLS policies\\nCREATE TABLE ...",
    "tables": [
      {
        "name": "table_name",
        "description": "Entity purpose and storage details",
        "columns": [
          { "name": "id", "type": "UUID PRIMARY KEY DEFAULT gen_random_uuid()", "description": "Primary key identifier" }
        ],
        "rlsPolicies": [
          "CREATE POLICY ... ON ... FOR SELECT USING (auth.uid() = user_id);"
        ]
      }
    ]
  },
  "apiSpecification": {
    "title": "REST & Serverless API Specification",
    "endpoints": [
      {
        "method": "GET | POST | PUT | DELETE",
        "path": "/api/...",
        "description": "Detailed explanation of what this endpoint does",
        "authRequired": true,
        "requestHeaders": { "Content-Type": "application/json" },
        "requestBody": "{\\n  \\\"field\\\": \\\"type and purpose\\\"\\n}",
        "successResponse": "{\\n  \\\"status\\\": 200,\\n  \\\"data\\\": { ... }\\n}",
        "errorResponses": [
          { "status": 400, "message": "Validation error" },
          { "status": 401, "message": "Unauthorized" }
        ]
      }
    ]
  },
  "aiPrompt": {
    "title": "Token-Optimized AI Coding Prompt (.cursorrules / AGENT_INSTRUCTIONS.md)",
    "description": "High-density instruction set engineered specifically for AI coding assistants (Cursor, Claude, Copilot, Antigravity) to minimize token consumption and prevent hallucination.",
    "content": "# AI CODING RULES & CONTEXT: [Project Name]\\n\\n## 1. TECH STACK & STRICT DEPENDENCIES\\n- Framework: ...\\n- Styling: ...\\n- Database: ...\\n\\n## 2. ARCHITECTURAL INVARIANTS\\n- Server components by default\\n- No inline styling\\n- Absolute imports (@/*)\\n\\n## 3. TYPESCRIPT & ERROR RULES\\n- Strict typing (zero 'any')\\n- Wrap database calls with proper error handling\\n\\n## 4. DATABASE & RLS CONTRACTS\\n...",
    "promptsByPhase": [
      {
        "phaseName": "Phase 1: Project Setup & Database Schema",
        "prompt": "Self-contained prompt to copy-paste into Cursor/Claude for Phase 1 without needing to re-send the whole PRD."
      },
      {
        "phaseName": "Phase 2: Auth Middleware & Supabase Clients",
        "prompt": "Self-contained prompt for Phase 2."
      },
      {
        "phaseName": "Phase 3: Core API Endpoints & Server Logic",
        "prompt": "Self-contained prompt for Phase 3."
      },
      {
        "phaseName": "Phase 4: Client Components & UI Views",
        "prompt": "Self-contained prompt for Phase 4."
      },
      {
        "phaseName": "Phase 5: Edge Cases, Testing & Verification",
        "prompt": "Self-contained prompt for Phase 5."
      }
    ]
  },
  "implementationRoadmap": {
    "title": "Step-by-Step Implementation Roadmap",
    "phases": [
      {
        "phase": "Phase 1: Project Setup & Schema Migration",
        "tasks": [
          "Task 1 with specific outcome",
          "Task 2 with specific outcome"
        ]
      }
    ]
  },
  "fullMarkdown": "# Complete Project Documentation Bundle\\n\\n[Full exhaustive markdown containing all sections, formatted beautifully with headers, codeblocks, tables, and checklists]"
}`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projErr || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const docs =
      project.docs ||
      project.documentation ||
      project.brainstorming_context?.docs ||
      project.brainstorming_context?.documentation ||
      null;

    return NextResponse.json({ docs });
  } catch (err: unknown) {
    console.error("Error fetching docs:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projErr || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const projectBrief =
      (project.brainstorming_context as Record<string, unknown>)?.project_brief ||
      project.description ||
      "Project concept";
    const techStack = project.tech_stack || "Next.js, TypeScript, TailwindCSS, Supabase";
    const workflowDiagram = project.workflow_diagram || "Core system architecture and flows";
    const uiStyle = project.ui_style || "Modern minimalist dark aesthetic";

    const userInput = `
Project Name: ${project.name}
Description: ${project.description || "N/A"}
Platform: ${project.platform || "Web"}

Project Brief & Context:
${typeof projectBrief === "string" ? projectBrief : JSON.stringify(projectBrief, null, 2)}

Selected Tech Stack:
${typeof techStack === "string" ? techStack : JSON.stringify(techStack, null, 2)}

Workflow & Diagram Architecture:
${typeof workflowDiagram === "string" ? workflowDiagram : JSON.stringify(workflowDiagram, null, 2)}

UI Design System & Style Guide:
${typeof uiStyle === "string" ? uiStyle : JSON.stringify(uiStyle, null, 2)}
`;

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInput },
    ];

    const rawResponse = (await chatWithGemini(messages, {
      temperature: 0.2,
      responseMimeType: "application/json",
    })) as string;

    let docData;
    try {
      const cleaned = rawResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      docData = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn("JSON parse fallback for detailed docs:", parseError);
      docData = {
        prd: {
          title: "Product Requirements Document (PRD)",
          executiveSummary: project.description || "Project specification",
          targetAudience: "Primary end-users and developers",
          problemStatement: "Providing an automated, seamless solution for this product category.",
          functionalRequirements: [
            {
              id: "FR-1",
              title: "Core Platform Experience",
              userStory: "As a user, I want to access primary functionality smoothly.",
              description: "Responsive interface for primary workflow.",
              acceptanceCriteria: ["User can access all features", "Fast render times"],
            },
          ],
          nonFunctionalRequirements: ["Sub-200ms API response", "Clean UI", "PostgreSQL RLS"],
          outOfScope: ["Third-party paid extensions in initial launch"],
        },
        architecture: {
          title: "System Architecture & Engineering Specification",
          pattern: "Modular Next.js App Router Architecture with Supabase",
          directoryStructure: "src/\n├── app/\n├── components/\n├── lib/\n└── types/",
          frontend: "React, TypeScript, Tailwind CSS with Server and Client component separation.",
          backend: "Next.js API route handlers with server-side validation and Supabase SSR.",
          database: "Supabase PostgreSQL with Row-Level Security (RLS) policies.",
          security: "JWT auth, cookie verification, and strict RLS.",
        },
        typeDefinitions: {
          title: "TypeScript Data Contracts & Interfaces",
          code: `export interface Project {\n  id: string;\n  name: string;\n  description?: string;\n  platform: 'Web' | 'Mobile' | 'Desktop';\n  status: string;\n  created_at: string;\n  user_id: string;\n}`,
        },
        databaseSchema: {
          title: "PostgreSQL Schema DDL & Row-Level Security",
          sql: `-- Schema for ${project.name}\nCREATE TABLE IF NOT EXISTS projects (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name TEXT NOT NULL,\n  user_id UUID REFERENCES auth.users(id),\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nALTER TABLE projects ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);`,
          tables: [{ name: "projects", description: "Stores application projects", columns: [], rlsPolicies: [] }],
        },
        apiSpecification: {
          title: "REST & Serverless API Specification",
          endpoints: [{ method: "GET", path: "/api/projects", description: "Retrieve user projects", authRequired: true }],
        },
        aiPrompt: {
          title: "Token-Optimized AI Coding Prompt (.cursorrules / AGENT_INSTRUCTIONS.md)",
          description: "High-density instruction set for AI tools (Cursor, Claude, Antigravity) to minimize token consumption.",
          content: `# PROJECT RULES: ${project.name}\nStack: Next.js 15, TypeScript, TailwindCSS, Supabase.\nStrict typing. Use server actions or API routes. Minimize context overhead.`,
          promptsByPhase: [
            {
              phaseName: "Phase 1: Setup & DB",
              prompt: `Set up the schema and project structure for ${project.name}.`,
            },
            {
              phaseName: "Phase 2: Core Build",
              prompt: `Implement core features and endpoints for ${project.name}.`,
            },
          ],
        },
        implementationRoadmap: {
          title: "Implementation Roadmap",
          phases: [
            { phase: "Phase 1: Setup", tasks: ["Scaffold project", "Setup DB"] },
            { phase: "Phase 2: Core Build", tasks: ["Implement views", "Wire APIs"] },
          ],
        },
        fullMarkdown: rawResponse,
      };
    }

    // Persist to database in 'docs' column
    let saved = false;
    try {
      const { error: saveDocsErr } = await supabase
        .from("projects")
        .update({ docs: docData })
        .eq("id", projectId);

      if (!saveDocsErr) {
        saved = true;
      }
    } catch {
      saved = false;
    }

    // Fallback if docs column does not exist yet
    if (!saved) {
      try {
        const { error: singleDocErr } = await supabase
          .from("projects")
          .update({ documentation: docData })
          .eq("id", projectId);
        if (!singleDocErr) saved = true;
      } catch {
        saved = false;
      }
    }

    // Secondary fallback: save inside brainstorming_context
    if (!saved) {
      const existingContext = (project.brainstorming_context as Record<string, unknown>) || {};
      await supabase
        .from("projects")
        .update({
          brainstorming_context: {
            ...existingContext,
            docs: docData,
          },
        })
        .eq("id", projectId);
    }

    return NextResponse.json({ docs: docData });
  } catch (err: unknown) {
    console.error("Docs generation error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
