import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const apiKey = process.env.GEMINI_API_KEY as string;
if (!apiKey) {
  // In development we want a clear error; in production Next.js build will also fail
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

// Model name: use Gemini 1.5 Pro if available, otherwise fall back to Pro
const MODEL_NAME = "gemini-3.5-flash-lite";

const genAI = new GoogleGenerativeAI(apiKey);

function mapToGenerativeAI(messages: ChatMessage[]) {
  // @google/generative-ai expects {role, parts:[{text:""}]}
  // We need to filter out the system message for gemini's history
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : m.role, // gemini uses "model" for assistant
      parts: [{ text: m.content }],
    }));
}

export async function chatWithGemini(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    stream?: boolean;
    responseMimeType?: "text/plain" | "application/json";
  }
): Promise<string | AsyncGenerator<string, void, unknown>> {
  // NOTE: we return either full text or async generator of chunks depending on options.stream
  const temperature = options?.temperature ?? 0.8;
  const stream = options?.stream ?? false;
  const responseMimeType = options?.responseMimeType;

  const systemInstruction = messages.find(m => m.role === 'system')?.content;

  const model: GenerativeModel = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature,
      ...(responseMimeType && { responseMimeType }),
    },
    ...(systemInstruction && { systemInstruction }),
  });

  const history = mapToGenerativeAI(messages);
  // The last message is the new prompt
  const lastMessage = history.pop();
  if (!lastMessage) {
    throw new Error("No user message found");
  }

  const chat = model.startChat({ history });

  if (stream) {
    const resultStream = await chat.sendMessageStream(lastMessage.parts);
    async function* iterate() {
      for await (const chunk of resultStream.stream) {
        if (chunk.text()) {
          yield chunk.text();
        }
      }
    }
    return iterate();
  }

  const result = await chat.sendMessage(lastMessage.parts);
  return result.response.text();
} 