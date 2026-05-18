import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_GROQ_MODEL, groqGenerateContent } from "@/lib/groq";

const ProfileSchema = z.object({
  interests: z.array(z.string()),
  skills: z.string(),
  goals: z.array(z.string()),
  hoursPerDay: z.number(),
  incomeTarget: z.number(),
  level: z.string(),
  tools: z.string(),
  language: z.string(),
  workStyle: z.string(),
  priorities: z.array(z.string()),
});

const InputSchema = z.object({
  message: z.string().min(1).max(12_000).trim(),
  profile: ProfileSchema.optional(),
  opportunitySummary: z.string().max(12_000).optional(),
  eventsSummary: z.string().max(12_000).optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .max(12)
    .optional(),
});

function buildCoachSystem(
  profile?: z.infer<typeof ProfileSchema>,
  opportunitySummary?: string,
  eventsSummary?: string,
) {
  const base = `You are EARNGEN-AI — a premium AI career mentor, strategist, and income coach for Indian students.
Tone: confident, warm, specific. Use ₹ for money. Short paragraphs, bullet lists when helpful.
Behave like a mix of career coach, freelancer guide, and startup advisor. Ask smart follow-ups when context is missing.`;

  if (!profile) return base;

  let prompt = `${base}

STUDENT PROFILE (use for every answer):
- Interests: ${profile.interests.join(", ") || "not specified"}
- Skills: ${profile.skills || "not specified"}
- Goals: ${profile.goals.join(", ") || "not specified"}
- Hours/day: ${profile.hoursPerDay}
- Income target (₹/month): ${profile.incomeTarget}
- Level: ${profile.level}
- Tools: ${profile.tools || "not specified"}
- Preferred language: ${profile.language}
- Work style: ${profile.workStyle || "not specified"}
- Priorities: ${profile.priorities.join(", ") || "not specified"}

Give actionable steps with specific platforms, apply links, match %, and ₹ ranges when discussing opportunities.`;

  if (opportunitySummary) {
    prompt += `

MATCHED OPPORTUNITIES (cite these — platform, earnings, timeline, how to apply):
${opportunitySummary}`;
  }

  if (eventsSummary) {
    prompt += `

LIVE EVENTS & HACKATHONS (recommend these with match %, deadlines, apply links):
${eventsSummary}`;
  }

  return prompt;
}

export const speakWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ reply: string; error?: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { reply: "", error: "GROQ_API_KEY is not configured on the server." };
    }

    const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    const system = buildCoachSystem(data.profile, data.opportunitySummary, data.eventsSummary);

    let userText = data.message;
    if (data.history?.length) {
      const transcript = data.history
        .map((m) => `${m.role === "user" ? "Student" : "Coach"}: ${m.content}`)
        .join("\n\n");
      userText = `Recent conversation:\n${transcript}\n\nStudent's new message:\n${data.message}`;
    }

    const { text, error } = await groqGenerateContent({
      apiKey,
      model,
      systemInstruction: system,
      userText,
    });

    if (error) return { reply: "", error };
    return { reply: text };
  });
