import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_GROQ_MODEL, groqGenerateContent } from "@/lib/groq";

const InputSchema = z.object({
  message: z.string().min(1).max(8000).trim(),
  courseTitle: z.string().max(200).optional(),
  lessonTitle: z.string().max(200).optional(),
  profileSummary: z.string().max(4000).optional(),
});

export const askLearnMentor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ reply: string; error?: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { reply: "", error: "GROQ_API_KEY is not configured on the server." };
    }

    const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    const system = `You are EARNGEN-AI Learning Mentor — a tutor + career coach + startup advisor.
Explain concepts simply. Recommend next lessons, mini projects, and quizzes when helpful.
Connect learning to earning (Fiverr, internships, hackathons on /nearby, gigs on /opportunities).
Use ₹ for India context. Short paragraphs, bullets when useful.
${data.courseTitle ? `Current course: ${data.courseTitle}` : ""}
${data.lessonTitle ? `Current lesson: ${data.lessonTitle}` : ""}
${data.profileSummary ? `Student: ${data.profileSummary}` : ""}`;

    const { text, error } = await groqGenerateContent({
      apiKey,
      model,
      systemInstruction: system,
      userText: data.message,
    });

    if (error) return { reply: "", error };
    return { reply: text };
  });
