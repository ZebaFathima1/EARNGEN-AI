/** Groq inference — OpenAI-compatible, free tier, very fast. */
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

type GroqMessage = { role: "system" | "user" | "assistant"; content: string };
type GroqChoice = { message?: { content?: string } };

export type GroqResult = { text: string; error?: string };

export async function groqGenerateContent(opts: {
  apiKey: string;
  model?: string;
  systemInstruction?: string;
  userText: string;
  /** When true, asks Groq to return valid JSON (json_object mode). */
  jsonMode?: boolean;
}): Promise<GroqResult> {
  const model = (opts.model ?? DEFAULT_GROQ_MODEL).trim() || DEFAULT_GROQ_MODEL;
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const messages: GroqMessage[] = [];
  if (opts.systemInstruction) {
    messages.push({ role: "system", content: opts.systemInstruction });
  }
  messages.push({ role: "user", content: opts.userText });

  const body: Record<string, unknown> = { model, messages, temperature: 0.7 };
  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    if (!res.ok) {
      return { text: "", error: `Groq ${res.status}: ${raw.slice(0, 400)}` };
    }

    const json = JSON.parse(raw) as {
      choices?: GroqChoice[];
      error?: { message?: string };
    };
    if (json.error?.message) {
      return { text: "", error: json.error.message };
    }

    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { text: "", error: "Empty model response" };
    return { text };
  } catch (e) {
    return { text: "", error: e instanceof Error ? e.message : "Groq request failed" };
  }
}
