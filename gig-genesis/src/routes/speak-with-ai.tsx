import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { AiCoachExperience } from "@/components/ai-coach/AiCoachExperience";

export const Route = createFileRoute("/speak-with-ai")({
  head: () => ({
    meta: [
      { title: "AI Career Mentor — EARNGEN-AI" },
      {
        name: "description",
        content:
          "Premium AI career assistant: personalized roadmap, gig matching, mentor chat, and earning strategy for students.",
      },
    ],
  }),
  component: SpeakWithAiPage,
});

function SpeakWithAiPage() {
  return (
    <Shell immersive>
      <RequireAuth>
        <AiCoachExperience />
      </RequireAuth>
    </Shell>
  );
}
