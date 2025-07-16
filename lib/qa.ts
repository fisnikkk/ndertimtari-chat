// lib/qa.ts
import OpenAI from "openai";
import { buildContext, matchTerms } from "./terms";
const key = process.env.OPENAI_API_KEY ?? "";
if (!key) {
  console.error("DEBUG: OPENAI_API_KEY missing (server-side).");
} else {
  console.log("DEBUG: OPENAI_API_KEY loaded (starts with):", key.slice(0, 7));
}

// Create a single client instance (server-side only).
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * askConstructionBot(question)
 * Detects known Albanian construction terms in the question,
 * builds a short context, and asks OpenAI for an answer in Albanian
 * (optionally mentioning English technical names in parentheses).
 */
export async function askConstructionBot(question: string): Promise<string> {
  const slugs = matchTerms(question);
  const context = buildContext(slugs);

  const systemBase =
    "Ti je 'Ndërtimtari Bot' – një asistent që shpjegon terma ndërtimi në shqip, " +
    "me emrin teknik anglisht në kllapa kur është e dobishme. Jep shpjegim të shkurtër, " +
    "si përdoret, materiale tipike dhe një këshillë sigurie nëse ka rrezik. Nëse nuk je i sigurt, thuaj hapur.";

  const systemContext = context
    ? `Informacion bazë për terma që mund të jenë të rëndësishëm:\n${context}`
    : "";

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemBase },
  ];

  if (systemContext) {
    messages.push({ role: "system", content: systemContext });
  }

  messages.push({ role: "user", content: question });

  const resp = await client.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 400,
    temperature: 0.2,
  });

  return resp.choices?.[0]?.message?.content?.trim() ?? "(asnjë përgjigje)";
}
