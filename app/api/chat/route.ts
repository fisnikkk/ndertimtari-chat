// app/api/chat/route.ts
import type { NextRequest } from "next/server";
import { askConstructionBot } from "../../../lib/qa";

/**
 * Expected request body shapes:
 *   { prompt: "..." }
 *   { messages: [{role:"user"|"assistant", content:"..."}, ...] }
 * We'll grab the *last* user message as the question.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({} as any));

    let question = "";

    // If messages[] provided, take last user content
    if (Array.isArray(body?.messages)) {
      for (let i = body.messages.length - 1; i >= 0; i--) {
        const m = body.messages[i];
        if (m?.role === "user" && typeof m?.content === "string") {
          question = m.content;
          break;
        }
      }
    }

    // Fallback to body.prompt
    if (!question && typeof body?.prompt === "string") {
      question = body.prompt;
    }

    if (!question.trim()) {
      return json(400, { error: "empty_question" });
    }

    const answer = await askConstructionBot(question);

    return json(200, {
      message: {
        role: "assistant",
        content: answer,
      },
    });
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
