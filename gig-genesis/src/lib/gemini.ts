/** Default when env is unset (match in .env for client + server). */
export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

export function normalizeGeminiModelId(raw: string | undefined): string {
  let m = (raw ?? DEFAULT_GEMINI_MODEL).trim();
  if (m.startsWith("models/")) m = m.slice("models/".length);
  return m || DEFAULT_GEMINI_MODEL;
}

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };

export type GeminiResult = { text: string; error?: string };

/**
 * Calls Google Generative Language API (Gemini).
 * @see https://ai.google.dev/api/rest/v1beta/models.generateContent
 */
export async function geminiGenerateContent(opts: {
  apiKey: string;
  model: string;
  systemInstruction?: string;
  userText: string;
  responseMimeType?: "application/json" | "text/plain";
}): Promise<GeminiResult> {
  const modelId = normalizeGeminiModelId(opts.model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: opts.userText }] }],
  };
  if (opts.systemInstruction) {
    body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
  }
  if (opts.responseMimeType) {
    body.generationConfig = { responseMimeType: opts.responseMimeType };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { text: "", error: `Gemini ${res.status}: ${raw.slice(0, 400)}` };
    }
    const json = JSON.parse(raw) as { candidates?: GeminiCandidate[]; error?: { message?: string } };
    if (json.error?.message) {
      return { text: "", error: json.error.message };
    }
    const parts = json.candidates?.[0]?.content?.parts;
    const text = parts?.map((p) => p.text ?? "").join("").trim() ?? "";
    if (!text) {
      return { text: "", error: "Empty model response" };
    }
    return { text };
  } catch (e) {
    return { text: "", error: e instanceof Error ? e.message : "Gemini request failed" };
  }
}
