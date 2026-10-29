import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { chatWithGemini, ChatMessage } from "@/lib/ai/gemini";

const SYSTEM_PROMPT = `AI Persona: Act as a Senior Systems Analyst.

System Prompt:
You are a Senior Systems Analyst. You have been provided with the Project Brief and the chosen Architecture. Your task is to generate a set of detailed system diagrams that serve as an unambiguous blueprint for development.

Your entire output must be a single, valid JSON object. Do not include any text or explanations outside of this JSON structure.

Your Process:
You will generate the following four diagrams. For each, provide both the Mermaid syntax for visual rendering and a JSON structure compatible with a library like React Flow for interactive use in an application.

1.  **High-Level Architecture Diagram:** A 'graph TD' Mermaid diagram showing the main services and how they connect.
2.  **User Authentication Sequence Diagram:** A 'sequenceDiagram' Mermaid diagram detailing the step-by-step interaction for user login and signup.
3.  **Core Feature User Flow:** A 'flowchart TD' Mermaid diagram mapping out the primary user journey defined in the Project Brief.
4.  **Database Schema Diagram:** An 'erDiagram' Mermaid diagram visualizing the database tables/collections and their relationships based on the project brief.

The final JSON object must have a key "diagrams" which contains an object with EXACTLY these four keys:
- "architecture" (for the High-Level Architecture)
- "authSequence" (for the User Authentication Sequence)
- "userFlow" (for the Core Feature User Flow)  
- "dbSchema" (for the Database Schema)

Each diagram object must have a "mermaid" string and a "reactFlow" JSON object (with "nodes" and "edges" keys).

Example JSON structure for a single diagram:
{
  "mermaid": "graph TD\\n A-->B",
  "reactFlow": {
    "nodes": [{"id":"A","position":{"x":0,"y":0},"data":{"label":"Node A"}}],
    "edges": [{"id":"A-B","source":"A","target":"B"}]
  }
}`;

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

    const { data: project } = await supabase
      .from("projects")
      .select("id, user_id, brainstorming_context, tech_stack")
      .eq("id", projectId)
      .single();

    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const projectBrief = (project.brainstorming_context as any)?.project_brief;
    const techStack = project.tech_stack;

    console.log("Flowchart generation debug:", {
      projectId,
      hasBrainstormingContext: !!project.brainstorming_context,
      hasProjectBrief: !!projectBrief,
      hasTechStack: !!techStack,
      briefLength: projectBrief ? projectBrief.length : 0
    });

    if (!projectBrief || !techStack) {
      return NextResponse.json(
        { error: "Project brief or tech stack not found." },
        { status: 404 }
      );
    }

    const userInput = `
      Project Brief:
      ${projectBrief}

      Chosen Tech Stack:
      ${JSON.stringify(techStack, null, 2)}
    `;

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInput },
    ];

    try {
      const diagramJson = await chatWithGemini(messages, {
        temperature: 0.1,
        responseMimeType: "application/json",
      }) as string;

      console.log("Raw AI response:", diagramJson.substring(0, 500) + "...");

      const parsed = JSON.parse(diagramJson);
      const rawDiagrams = parsed.diagrams ?? parsed; // Gemini already wraps in "diagrams" key per prompt

      console.log("Raw diagram keys:", Object.keys(rawDiagrams));

      // Map AI's keys to frontend's expected keys
      const diagramSet = {
        architecture: rawDiagrams.highLevelArchitecture || rawDiagrams.architecture,
        authSequence: rawDiagrams.userAuthenticationSequence || rawDiagrams.authSequence,
        userFlow: rawDiagrams.coreFeatureUserFlow || rawDiagrams.userFlow,
        dbSchema: rawDiagrams.databaseSchemaDiagram || rawDiagrams.dbSchema
      };

      console.log("Mapped diagram keys:", Object.keys(diagramSet));
      console.log("All diagrams present:", Object.values(diagramSet).every(d => d !== undefined));

      const { error: saveError } = await supabase
        .from("projects")
        .update({ workflow_diagram: diagramSet })
        .eq("id", projectId);

      if (saveError) {
        console.error("Database save error:", saveError);
        throw new Error("Failed to save diagrams to database");
      }

      return NextResponse.json({ diagrams: diagramSet });

    } catch (aiError) {
      console.error("AI generation or parsing error:", aiError);
      throw aiError;
    }

  } catch (error) {
    console.error("Error generating flowchart:", error);
    return NextResponse.json(
      { error: "Failed to generate flowchart diagrams." },
      { status: 500 }
    );
  }
} 