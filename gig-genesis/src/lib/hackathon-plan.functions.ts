import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_GROQ_MODEL, groqGenerateContent } from "@/lib/groq";

const InputSchema = z.object({
  eventTitle: z.string().min(1).max(300),
  description: z.string().max(4000).optional(),
  skills: z.array(z.string()).max(20),
  interests: z.array(z.string()).max(20),
  level: z.string().max(40),
  prizePool: z.string().max(200).optional(),
});

export type HackathonPlan = {
  projectIdeas: string[];
  techStack: string[];
  pptOutline: string[];
  mvpRoadmap: { phase: string; tasks: string[] }[];
  teamRoles: string[];
  timeline: { week: string; focus: string }[];
  winningStrategy: string;
};

const FALLBACK = (title: string, skills: string[]): HackathonPlan => ({
  projectIdeas: [
    `AI copilot for ${skills[0] ?? "students"} — ties to ${title}`,
    "Micro-SaaS dashboard with freemium onboarding",
    "Community tool that matches mentors in 24h",
  ],
  techStack: ["React", "Vite", skills[0] ?? "Node", "Supabase", "Groq API"],
  pptOutline: ["Problem & user", "Solution demo", "Market size", "Business model", "Roadmap", "Team", "Ask"],
  mvpRoadmap: [
    { phase: "Day 1", tasks: ["Pick idea", "Wireframe", "Set up repo"] },
    { phase: "Day 2", tasks: ["Core feature", "Landing page"] },
    { phase: "Day 3", tasks: ["Polish UI", "Record demo", "Submit"] },
  ],
  teamRoles: ["Lead dev", "UI/UX", "Pitch & integrations"],
  timeline: [
    { week: "Week 1", focus: "Validate idea + recruit team" },
    { week: "Week 2", focus: "Build MVP + practice pitch" },
  ],
  winningStrategy: "Ship a working demo, tell a clear story, and show traction metrics even if small.",
});

export const generateHackathonPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ plan: HackathonPlan; source: "ai" | "fallback"; error?: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { plan: FALLBACK(data.eventTitle, data.skills), source: "fallback", error: "GROQ_API_KEY not set" };
    }

    const system = `You are an elite hackathon coach. Return ONLY valid JSON matching this schema:
{
  "projectIdeas": string[3],
  "techStack": string[],
  "pptOutline": string[],
  "mvpRoadmap": [{"phase": string, "tasks": string[]}],
  "teamRoles": string[],
  "timeline": [{"week": string, "focus": string}],
  "winningStrategy": string
}
Be specific to the hackathon title and student skills. Use ₹ where relevant for India.`;

    const userText = `Hackathon: ${data.eventTitle}
Description: ${data.description ?? "N/A"}
Skills: ${data.skills.join(", ")}
Interests: ${data.interests.join(", ")}
Level: ${data.level}
Prize: ${data.prizePool ?? "N/A"}`;

    const { text, error } = await groqGenerateContent({
      apiKey,
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
      systemInstruction: system,
      userText,
      jsonMode: true,
    });

    if (error || !text) {
      return { plan: FALLBACK(data.eventTitle, data.skills), source: "fallback", error };
    }

    try {
      const plan = JSON.parse(text) as HackathonPlan;
      return { plan, source: "ai" };
    } catch {
      return { plan: FALLBACK(data.eventTitle, data.skills), source: "fallback", error: "Invalid JSON from AI" };
    }
  });
