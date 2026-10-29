# CursorIt - Complete Project Overview & Specification

## Project Vision & Purpose

The **CursorIt** is a Next.js-based web application designed to solve the "blank canvas problem" that developers face when starting new projects in Cursor IDE. It transforms vague project ideas into structured, actionable development plans with complete Cursor-ready starter kits through AI-powered brainstorming, intelligent planning, and comprehensive documentation generation.

### Objectives

- **Eliminate Setup Friction**: Streamline the initial planning and setup process for developers.
- **Enhance Productivity**: Provide a structured approach to project initialization, reducing decision fatigue.
- **Optimize for AI**: Generate documentation and specifications that enable AI tools like Cursor to build projects efficiently and accurately.

### Target Users

- **Beginners**: Developers needing guidance to start projects.
- **Experienced Developers**: Professionals seeking to accelerate project kickoff.
- **Vibe Coders**: Users relying heavily on AI to write code, requiring AI-friendly tech stacks.

### What This Application IS

- A comprehensive project planning and documentation generator.
- An AI-powered brainstorming assistant for developers.
- A tool that creates structured project blueprints optimized for Cursor IDE.
- A documentation suite generator (PRD, cursor rules, design systems, etc.).
- A visual flowchart creator for app/website user flows.
- An ASCII layout generator for AI comprehension.

### What This Application IS NOT

- A code generator (it produces documentation, not implementation code).
- A UI mockup tool (flowcharts show page names, not designs).
- A deployment platform.
- An IDE replacement.

## Application Flow

The application guides users through a structured journey to plan and set up their project, as outlined in the flowchart:

```
Project Name
    ↓
Choosing the Platform
    ↓
[Chat ↔ Voice ↔ PDF] (Brainstorming - bidirectional)
    ↓
Tech Stack
    ↓
Flowchart Making
    ↓
UI Designer
    ↓
PRD, Rules & Overview
    ↓
TODO

```

### Step-by-Step User Journey

1. **Project Name**: Users enter the project name and an optional description.
2. **Choosing the Platform**: Users select the application type (Web, Mobile, Desktop).
3. **Brainstorming Session**: Users engage with AI via chat, voice, or PDF uploads to define requirements.
4. **Tech Stack**: AI recommends a tech stack based on the user’s coding approach (vibe coding or traditional).
5. **Flowchart Making**: AI generates an editable flowchart of the user flow.
6. **UI Designer**: Users define the visual style via presets or image uploads, generating a design system and ASCII layouts.
7. **PRD, Rules & Overview**: AI compiles all data into a documentation suite.
8. **TODO**: AI generates a task breakdown for development.

## Detailed Feature Specifications

### 1. Project Initialization

- **Purpose**: Capture basic project information to start the planning process.
- **Implementation**:
    - Simple form with a project name input field and optional description textarea.
    - Data saved to Supabase database under the `projects` table.
    - Redirects to the platform selection screen upon submission.

### 2. Choosing the Platform

- **Purpose**: Define the type of application being built to inform subsequent recommendations.
- **Implementation**:
    - Card-based selection interface with three options:
        - **Web Application**: For websites and web apps.
        - **Mobile Application**: For iOS/Android apps.
        - **Desktop Application**: For Electron/native desktop apps.
    - Selection stored in the `projects` table’s `platform` field.
- **UI Design**:
    - Cards with platform-specific icons (e.g., browser for Web, phone for Mobile, monitor for Desktop).
- **Technical Note**: Influences AI’s tech stack recommendations and documentation structure.

### 3. AI-Guided Brainstorming Session

- **Purpose**: Gather comprehensive project requirements through a unified, flexible input interface.
- **Unified Multi-Modal Input Interface**:
    - **Single Input Box**: Standard text input field integrated with voice and PDF capabilities, similar to ChatGPT/Claude interface.
    - **Voice Input**: Microphone button within the input box. Click to record with waveform animation, click stop to transcribe via OpenAI Whisper API. Transcribed text appears in input box for editing.
    - **PDF Upload**: Attachment button and drag-and-drop zone within the interface. Text extraction via Supabase Edge Functions, content automatically incorporated into conversation.
    - **AI Conversation**: Real-time messaging with Google Vertex AI (Gemini 2.5 Pro). AI conducts iterative questioning session, probing deeper into project details until reaching 80-85% completeness confidence.
- **Behavior**:
    - **Iterative Questioning**: AI conducts comprehensive brainstorming like a collaborative friend, continuously asking follow-up questions until achieving 80-85% project understanding. Questions cover missing details, clarifications, edge cases, and unexplored aspects.
    - **Dynamic Question Generation**: AI identifies knowledge gaps in real-time and asks targeted questions like "What happens when a user tries to X?", "How should the system handle Y scenario?", or "Can you elaborate on the Z functionality?"
    - **Completeness Validation**: AI doesn't conclude session until confident it has captured the complete project vision, preventing downstream misinterpretation during code generation.
    - **Seamless Flow**: Users can type, speak, and upload PDFs within the same conversation thread without switching modes.
    - **Contextual Continuity**: AI processes all input types as part of one unified conversation, referencing previous inputs regardless of modality.
    - **Unified Output**: All inputs synthesized into comprehensive `brainstorming_context` JSON stored in `projects` table.
- **Storage**:
    - History saved in `ai_conversations` table.
    - Voice transcripts and PDF content stored in `file_uploads` table.

### 4. Vibe Coding Detection & Tech Stack Recommendation

- **Purpose**: Tailor technology recommendations to the user’s coding approach.
- **User Flow**:
    1. Question: "Will you be primarily using AI to write code (vibe coding)?"
    2. AI adjusts recommendations based on response.
- **Output**:
    - Stored as `tech_stack` JSON in the `projects` table:

### 5. Interactive Flowchart Generator

- **Purpose**: Create a visual representation of the application’s user flow.
- **Initial AI Generation**:
    - AI generates a flowchart based on brainstorming context, including:
        - Login/Auth screens
        - Dashboard
        - Splash screen (for mobile)
        - Settings/Profile pages
        - Core feature pages
    - Uses React Flow library for rendering.
- **Flowchart Characteristics**:
    - Simple rectangles with page names (no UI designs).
    - Arrows indicating navigation flow.
- **Interactive Features**:
    - Drag-and-drop editing on a canvas.
    - Add/delete pages, edit names, adjust connections.
- **Storage**:
    - Saved as `workflow_diagram` JSON in the `projects` table.
    Example:
        
        ```json
        {
          "nodes": [
            {"id": "1", "data": {"label": "Login"}, "position": {"x": 100, "y": 100}},
            {"id": "2", "data": {"label": "Dashboard"}, "position": {"x": 300, "y": 100}}
          ],
          "edges": [
            {"id": "e1-2", "source": "1", "target": "2", "label": "Login Success"}
          ]
        }
        
        ```
        

### 6. UI Designer

- **Purpose**: Define the visual design system and generate AI-friendly layouts.
- **Options**:
    - **Preset Styles**:
        - **Glassmorphism**: Translucent, blurred backgrounds with vibrant gradients.
        - **Neumorphism**: Soft, extruded appearance using subtle inner/outer shadows.
        - **Skeuomorphism**: Realistic textures and lighting that mimic real-world objects.
        - **Flat Design**: Minimal, no shadows, solid colors with focus on simplicity.
        - **Material Design**: Google’s design system using elevation, motion, and grid layouts.
        - **Aurora/Gradient Aesthetic**: Flowing, organic gradients resembling auroras or liquid.
        - **Brutalism**: Raw, unstyled, intentionally rough and "ugly" aesthetic.
        - **Minimalism / Ultra-minimalism**: Clean layouts with ample whitespace and minimal elements.
        - **Retro Futurism / Vaporwave**: Neon, 90s-inspired colors and nostalgic UI elements.
        - **Dark Mode UI**: Dark background-focused themes with adapted contrast and accents.
        - **Cyberpunk / Sci-fi Aesthetic**: Neon lighting, dark themes, and futuristic typefaces.
    - **Image Upload & Analysis**:
        - Users upload a full-page screenshot (e.g., via browser dev tools) of a website or maybe an app they want to recreate.
        - Gemini AI from the image analyzes and extracts:
            - Colors (primary, secondary, background, text)
            - Typography (font family, sizes, weights)
            - Spacing (unit, xs, sm, md, lg, xl)
            - Border radius
            - Shadows
        - Generates `ui_style` JSON, example:
            
            ```json
            {
              "colors": {
                "primary": "#3B82F6",
                "secondary": "#10B981",
                "background": "#FFFFFF",
                "text": "#1F2937"
              },
              "typography": {    
                "fontFamily": "Inter, sans-serif",
                "fontSize": {
                  "h1": "2.5rem",
                  "h2": "2rem",
                  "body": "1rem"
                },
                "fontWeight": {
                  "regular": 400,
                  "bold": 700
                }
              },
              "spacing": {
                "unit": "8px",
                "md": "16px",
                "lg": "24px"
              }
            }
            
            ```
            

### 7. Documentation Generation

- **Purpose**: Compile all data into a comprehensive documentation suite.
- **Generated Files**:
    - **Project Requirements Document (PRD)**:
        - Project overview, problem statement, solution, target audience, core features, technical requirements.
    - **Cursor Rules (.cursorrules)**:
        
        ```
        # Project-Specific Rules for [Project Name]
        ## Tech Stack
        - Frontend: Next.js 15+ with TypeScript
        - Styling: Tailwind CSS
        ## Code Style
        - Use functional components
        - Follow atomic design
        ## Design System
        - Primary Color: #3B82F6
        - Font: Inter
        
        ```
        
    - **Project Overview (overview.md)**:
        - Architecture, tech choices, phases.
    - **TODO List (todo.md)**:
        
        ```markdown
        # Project TODO List
        ## Phase 1: Foundation
        - Set up Next.js project
        - Configure Supabase
        
        ```
        
- **Storage**: Saved as `generated_files` JSON in the `projects` table.

## Technical Architecture

### Tech Stack

- **Frontend**: Next.js 15+ with TypeScript
- **Backend**: Supabase with Edge Functions
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Google OAuth + Email/Password)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query
- **AI Integration**:
    - Google Vertex AI (Gemini 2.5 Pro) for conversational AI and image analysis.
    - OpenAI Whisper for voice transcription.

### Database Schema (Supabase PostgreSQL)

```sql
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  project_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'brainstorming',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  brainstorming_context jsonb,
  tech_stack jsonb,
  workflow_diagram jsonb,
  ui_style jsonb,
  generated_files jsonb,
  export_history jsonb[]
);

CREATE TABLE file_uploads (
  id uuid OWNED BY gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  file_type text,
  file_name text,
  file_path text,
  processed_content jsonb,
  created_at timestamp DEFAULT now()
);

CREATE TABLE ai_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  conversation_history jsonb,
  context_tokens integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

```

## User Interface & Experience

### Key Pages

- **Homepage/Landing**: Showcases value proposition, includes authentication.
- **Dashboard**: Lists projects with status indicators, "Create New Project" CTA.
- **Brainstorming Session**: Multi-modal input interface (chat, voice, PDF).
- **Project Planning Workspace**: Tech stack selection, flowchart editing, documentation preview.
- **Documentation Viewer**: Tabbed interface for generated files with copy-to-clipboard.

### Multi-Modal Input

- Seamless switching between chat, voice, and PDF inputs.
- Real-time context aggregation displayed to the user.

## AI Integration

- **Google Vertex AI**: Drives conversational AI in brainstorming and also image analysis for the UI explanation from an image.
- **OpenAI Whisper**: Transcribes voice recordings.

## Future Enhancements

- **Real-Time Collaboration**: Multi-user project planning.
- **Template Marketplace**: Pre-built project templates.
- **Integrations**: GitHub, Slack, VS Code extensions.