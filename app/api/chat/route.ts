/* app/api/chat/route.ts */
import type { NextRequest } from "next/server";
import { askConstructionBot } from "@/lib/qa";

type ChatMessage = { role?: string; content?: string };
interface ChatRequestBody {
  prompt?: string;
  messages?: ChatMessage[];
}

/**
 * Accepts POST JSON:
 *   { prompt: "..." }
 *   { messages: [{role:"user", content:"..."}, ...] }
 */
export async function POST(req: NextRequest): Promise<Response> {
  let body: ChatRequestBody = {};

  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    // ignore bad JSON; keep body = {}
  }

  // Extract the question (last user message; fallback prompt)
  let question = "";

  if (Array.isArray(body.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i--) {
      const m = body.messages[i];
      if (m?.role === "user" && typeof m?.content === "string") {
        question = m.content;
        break;
      }
    }
  }

  if (!question && typeof body.prompt === "string") {
    question = body.prompt;
  }

  if (!question.trim()) {
    return json(400, { error: "empty_question" });
  }

  try {
    const answer = await askConstructionBot(question);
    return json(200, { message: { role: "assistant", content: answer } });
  } catch (err) {
    console.error("/api/chat error:", err);
    return json(500, {
      error: "internal_error",
      message: String((err as Error).message || err),
    });
  }
}

function json(status: number, obj: unknown) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
