import { NextRequest, NextResponse } from "next/server";
import { chatWithGemini, ChatMessage } from "@/lib/ai/gemini";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PROJECT_BRIEF_PROMPT = `Based on our entire conversation, please generate a comprehensive Project Brief that synthesizes all the information we've discussed. The Project Brief should contain the following sections:

**Executive Summary**: A compelling one-paragraph pitch that captures the essence of the project.

**Problem Statement**: A clear, concise description of the user's pain point or challenge this project addresses.

**Proposed Solution**: A high-level overview of how the product/application functions and solves the problem.

**Primary User Persona**: A detailed description of the ideal target user, including their background, needs, and motivations.

**Unique Value Proposition**: What makes this project different and better than existing alternatives in the market.

**MVP Feature Set**: A bulleted list of the 3-5 essential features that must be included in the first version.

**Technical Considerations**: Any important technical requirements, constraints, or architectural decisions mentioned.

Please format this as a well-structured document that could be used by developers and stakeholders to understand and build this project.`;

export async function POST(req: NextRequest) {
  try {
    const { projectId } = (await req.json()) as {
      projectId: string;
    };

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Validate user session
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the project belongs to the current user and get existing brief
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, user_id, brainstorming_context")
      .eq("id", projectId)
      .single();

    if (projErr || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch conversation history
    const { data: convoRow, error: convoErr } = await supabase
      .from("ai_conversations")
      .select("conversation_history")
      .eq("project_id", projectId)
      .single();

    if (convoErr || !convoRow || !convoRow.conversation_history) {
      return NextResponse.json({ error: "No conversation found" }, { status: 404 });
    }

    const history = convoRow.conversation_history as ChatMessage[];
    
    // Check if brief already exists and conversation hasn't changed
    const existingBrief = project.brainstorming_context;
    if (existingBrief && existingBrief.conversation_hash) {
      // Create a simple hash of the conversation to detect changes
      const currentConversationHash = JSON.stringify(history).length.toString();
      
      if (existingBrief.conversation_hash === currentConversationHash) {
        // No new content added, return existing brief
        return NextResponse.json({ 
          success: true, 
          message: "Using existing project brief (no new content detected)",
          alreadyExists: true
        });
      }
    }

    try {
      // Add the project brief generation prompt
      const briefGenerationHistory: ChatMessage[] = [
        ...history,
        { role: "user", content: PROJECT_BRIEF_PROMPT }
      ];

      // Generate the project brief
      const projectBrief = (await chatWithGemini(briefGenerationHistory, {
        stream: false,
      })) as string;

      // Create conversation hash for future comparisons
      const conversationHash = JSON.stringify(history).length.toString();

      // Save the project brief to brainstorming_context
      const { error: updateErr } = await supabase
        .from("projects")
        .update({ 
          brainstorming_context: {
            project_brief: projectBrief,
            generated_at: new Date().toISOString(),
            conversation_summary: "Generated from brainstorming session",
            conversation_hash: conversationHash
          }
        })
        .eq("id", projectId);

      if (updateErr) {
        console.error("Failed to save project brief:", updateErr);
        return NextResponse.json({ error: "Failed to save project brief" }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Project brief generated and saved successfully",
        regenerated: !!existingBrief
      });

    } catch (aiError) {
      console.error("AI generation failed:", aiError);
      
      // If we have an existing brief, use it as fallback
      if (existingBrief && existingBrief.project_brief) {
        return NextResponse.json({ 
          success: true, 
          message: "Using existing project brief (AI generation failed)",
          usedFallback: true
        });
      }
      
      // No fallback available, return error
      throw aiError;
    }

  } catch (error) {
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in /api/brainstorm/generate-brief:", {
      message: errorMessage,
      stack: (error instanceof Error) ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}