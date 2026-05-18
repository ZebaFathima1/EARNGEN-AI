import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { LearnHub } from "@/components/learn/LearnHub";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — EARNGEN-AI" },
      {
        name: "description",
        content: "AI-powered courses, YouTube learning, streaks, and paths from learning to earning.",
      },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <Shell>
      <RequireAuth>
        <LearnHub />
      </RequireAuth>
    </Shell>
  );
}
