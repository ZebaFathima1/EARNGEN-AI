import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_GROQ_MODEL, groqGenerateContent } from "@/lib/groq";

const InputSchema = z.object({
  message: z.string().min(1).max(12_000).trim(),
});

export const speakWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ reply: string; error?: string }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { reply: "", error: "GROQ_API_KEY is not configured on the server." };
    }

    const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

    const system = `You are EARNGEN-AI, a concise career and income coach for students in India. 
Help users turn ideas into actionable next steps (gigs, pricing in ₹, platforms like Fiverr/Unstop, realistic timelines). 
Use clear markdown-style headings when helpful. Stay practical and encouraging.`;

    const { text, error } = await groqGenerateContent({
      apiKey,
      model,
      systemInstruction: system,
      userText: data.message,
    });

    if (error) return { reply: "", error };
    return { reply: text };
  });
