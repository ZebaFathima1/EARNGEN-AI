import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_GROQ_MODEL, groqGenerateContent } from "@/lib/groq";

const InputSchema = z.object({
  gigTitle: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  skills: z.array(z.string().min(1).max(60)).min(1).max(15),
  city: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  platforms: z.array(z.string().min(1).max(60)).max(10).optional(),
  minPrice: z.number().int().min(0).max(1_000_000),
  maxPrice: z.number().int().min(0).max(1_000_000),
});

export type RoadmapDay = {
  day: number;
  title: string;
  detail: string;
  script?: string;
  youtube?: { query: string; url: string }[];
};

const FALLBACK = (data: z.infer<typeof InputSchema>): RoadmapDay[] => [
  { day: 1, title: "Lock your offer & profile", detail: `Write a one-line offer for "${data.gigTitle}". Set up profiles on ${(data.platforms ?? ["Fiverr", "Unstop"]).join(", ")}.` },
  { day: 2, title: "Build a 2-sample portfolio", detail: "Create 2 sample deliverables to use as proof in cold outreach." },
  { day: 3, title: "Send 15 cold messages", detail: "Message 15 prospects today. Personalize the first line of each." },
  { day: 4, title: "Follow up + post in groups", detail: "Re-message non-responders. Post your offer in 3 communities/WhatsApp groups." },
  { day: 5, title: "Get on a discovery call", detail: "Convert one warm reply to a 10-min call. Ask about budget, deadline, references." },
  { day: 6, title: "Send a tight quote", detail: `Quote inside ₹${data.minPrice}–₹${data.maxPrice}. Ask for 50% advance via UPI.` },
  { day: 7, title: "Deliver + log income", detail: "Deliver clean files. Log payment on EARNGEN-AI to mint your first Proof-of-Work." },
];

export const generateRoadmap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ days: RoadmapDay[]; source: "ai" | "fallback"; error?: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { days: FALLBACK(data), source: "fallback", error: "GROQ_API_KEY missing" };
    }

    const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    const topicLine = data.skills.join(", ");

    const userPrompt = `Build a personalized 7-day execution sprint to land the first paid project for the gig below.

PRIMARY TOPIC (every day, every YouTube query, every script line, and every action MUST stay strictly inside this scope — no other languages, frameworks, or unrelated skills): ${topicLine}

Gig: ${data.gigTitle}
Description: ${data.description}
City: ${data.city}
Student name: ${data.name}
Platforms to use: ${(data.platforms ?? ["Fiverr", "Unstop"]).join(", ")}
Target payout: ₹${data.minPrice}–₹${data.maxPrice}

Return ONLY valid JSON matching this schema (no markdown, no commentary):
{"days":[{"day":1,"title":"...","detail":"2-3 sentence concrete actions","script":"optional cold outreach DM, 2-3 sentences","youtube":[{"query":"specific learning topic","url":"https://www.youtube.com/results?search_query=URL+ENCODED+QUERY"}]}, ...7 days]}

Rules:
- Exactly 7 days (day 1 through 7).
- Day 1-2: setup + learning. Include 1-2 youtube entries on days 1-2 only; each "query" must name the PRIMARY TOPIC explicitly.
- Day 3-4: outreach. Include a "script" field that sells ONLY this gig and PRIMARY TOPIC, using the student's name and city.
- Day 5-7: closing + delivery + logging income; still reference the same gig and topic only.
- If PRIMARY TOPIC is a single language (Python, Java, JavaScript, etc.), never mention other languages as alternatives.`;

    try {
      const { text: content, error: genErr } = await groqGenerateContent({
        apiKey,
        model,
        systemInstruction:
          "You are an expert career coach for Indian college students and a precise JSON generator. Output only valid JSON, no markdown fences.",
        userText: userPrompt,
        jsonMode: true,
      });

      if (genErr || !content) {
        console.error("Groq roadmap error:", genErr);
        return { days: FALLBACK(data), source: "fallback", error: genErr ?? "Empty response" };
      }

      let jsonStr = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr) as { days?: RoadmapDay[] };
      if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
        return { days: FALLBACK(data), source: "fallback", error: "Bad AI shape" };
      }

      const days = parsed.days.slice(0, 7).map((d, i) => ({
        day: d.day ?? i + 1,
        title: String(d.title ?? `Day ${i + 1}`).slice(0, 120),
        detail: String(d.detail ?? "").slice(0, 600),
        script: d.script ? String(d.script).slice(0, 600) : undefined,
        youtube: Array.isArray(d.youtube)
          ? d.youtube.slice(0, 3).map((y) => ({
              query: String(y.query ?? "").slice(0, 120),
              url: String(y.url ?? "").startsWith("https://www.youtube.com/")
                ? y.url
                : `https://www.youtube.com/results?search_query=${encodeURIComponent(String(y.query ?? ""))}`,
            }))
          : undefined,
      }));

      return { days, source: "ai" };
    } catch (e) {
      console.error("Roadmap AI failed:", e);
      return { days: FALLBACK(data), source: "fallback", error: e instanceof Error ? e.message : "unknown" };
    }
  });
