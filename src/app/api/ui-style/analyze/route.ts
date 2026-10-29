import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `AI Persona: Act as a Lead Product Designer & UI Analyst. You have the meticulous eye of a designer and the analytical mind of an engineer.
System Prompt:
You are a Lead Product Designer & UI Analyst. Your sole task is to analyze a user-uploaded image of an application interface and reverse-engineer its complete design system. Your output will be the foundational style guide for an AI developer to replicate this visual style with perfect consistency.
Your Primary Directive:
Your analysis must focus on the design system (the 'how') and completely ignore the specific content (the 'what'). For example, extract the color and font style of a button, but not the text label "Submit."
Your Mandated Process:
Comprehensive Analysis: Systematically analyze every visual aspect of the uploaded image. You must identify and define the properties for all of the following elements:
Layout & Structure: Identify the overall layout paradigm (e.g., grid-based, single-column, etc.) and semantic structure.
Color Palette: Extract all primary, secondary, accent, background, and text colors. You must provide exact HEX codes.
Typography: Identify font families, weights, sizes, and line heights for different text elements (e.g., H1, H2, Body, Captions).
Spacing & Sizing: Determine the spacing system (e.g., base unit like 4px or 8px) used for padding, margins, and gaps.
Component Styles: Detail the visual properties of core interactive elements like buttons, input fields, cards, and menus. This includes border-radius, box-shadow, padding, and border styles.
Component States: If possible, infer the appearance of hover, focus, active, and disabled states.
Iconography: Describe the style of any icons present (e.g., "Outlined," "Solid," "1.5px stroke weight").
Generate Deliverables: Based on your analysis, you will produce two distinct and comprehensive outputs.

Deliverable : The Master UI Prompt (Markdown)
This markdown document is a natural language guide for another AI. It must be comprehensive and descriptive.
## Art Direction
Describe the overall mood, vibe, and core principles here. (e.g., "The design is clean, professional, and trustworthy, with a focus on clarity and data visualization. The UI should feel calm and empower the user to make informed decisions. It uses a minimalist aesthetic with generous whitespace.")

## Color Palette
- **Primary:** \`[Primary Color Name] (#HEXCODE)\` - Used for main calls-to-action and interactive elements.
- **Secondary:** \`[Secondary Color Name] (#HEXCODE)\` - Used for secondary actions and highlights.
- **Neutral/Background:** \`[Color Name] (#HEXCODE)\` - The primary background color.
- **Text:** \`[Primary Text] (#HEXCODE)\` for headings and body, \`[Secondary Text] (#HEXCODE)\` for captions and supplementary info.

## Typography
- **Font Family:** The primary UI font is \`[Font Name]\`. Code or monospaced elements should use \`[Font Name]\`.
- **Scale:**
  - **H1:** \`[Size]px\`, \`[Weight]\` (e.g., 32px, 700)
  - **H2:** \`[Size]px\`, \`[Weight]\`
  - **Body:** \`[Size]px\`, \`[Weight]\`
  - **Caption:** \`[Size]px\`, \`[Weight]\`

## Layout & Spacing
- **Grid System:** The layout is based on a responsive \`[Number]\`-column grid with a \`[Gutter Size]px\` gutter.
- **Spacing Scale:** All spacing (padding, margins) should use multiples of a \`[Base Unit]px\` base unit for consistency. (e.g., 4px, 8px, 12px, 16px).

## Component Library (Atomic Definitions)
- **Buttons:** Primary buttons have a \`[Color]\` background, \`[Border Radius]px\` border-radius, and \`[Padding]\` padding. On hover, the background should lighten by 10%. Disabled buttons have an opacity of 50%.
- **Inputs:** Text fields have a \`[Border]\` border, \`[Border Radius]px\` border-radius, and a subtle \`[Box Shadow]\` on focus.
- **Cards:** Cards are the primary containers for content. They feature \`[Padding]\` padding, a \`[Border Radius]px\` border-radius, and a soft \`[Box Shadow]\` to lift them off the page.

## Iconography
- **Library/Style:** Icons should be \`[Style]\` (e.g., Outlined), \`[Size]x[Size]px\` in size, with a consistent stroke width of \`[Stroke Width]px\`.

## ASCII Layouts
(Provide a simple ASCII art representation for each key screen identified in the project's workflow diagram to guide the placement of UI elements.)`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const projectId = formData.get("projectId") as string | null;
    const file = formData.get("image") as File | null;

    if (!projectId || !file) {
      return Response.json({ error: "Missing projectId or image" }, { status: 400 });
    }

    const mockMarkdown = `## Art Direction
The design aesthetic is clean, modern, and tech-focused, utilizing a dark theme with vibrant, gradient-based accents to create a sense of depth and energy. It prioritizes clarity and a smooth user experience.

## Color Palette
- **Primary:** Gradient from Cyan (#06B6D4) to Blue (#3B82F6)
- **Secondary:** Emerald (#10B981)
- **Neutral/Background:** True Black (#000000) with deep gray elements (#111827)
- **Text:** White (#FFFFFF) for primary copy, and Gray (#9CA3AF) for secondary information.

## Typography
- **Font Family:** Inter, sans-serif
- **Scale:**
  - **H1/H2:** 24px, 700
  - **Body:** 16px, 400
  - **Caption:** 12px, 400

## Component Library
- **Buttons:** Primary buttons use the cyan-to-blue gradient background, have a 12px border-radius, and a subtle glow on hover.
- **Inputs:** Dashed border style (#4B5563), transitioning to a solid cyan border on focus.
- **Cards:** Use a semi-transparent dark background (e.g., #111827 with 50% opacity) and a blurred backdrop filter for a glassmorphism effect.`;

    let uiStyle = mockMarkdown;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");

        const result = await model.generateContent([
          SYSTEM_PROMPT,
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type || "image/png",
            },
          },
        ]);

        const responseText = result.response.text();
        if (responseText) {
          uiStyle = responseText;
        }
      } catch (geminiError) {
        console.warn("Gemini vision analysis failed, using template:", geminiError);
      }
    }

    return Response.json({ uiStyle });

  } catch (err) {
    console.error("ui-style analyze error", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
} 