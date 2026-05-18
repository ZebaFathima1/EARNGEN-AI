import { useMemo } from "react";
import { useAiCoachState } from "./store";
import { buildRecommendations } from "./recommendations";
import type { AiOpportunityPlan, StudentProfile } from "./types";
import type { AppState } from "@/lib/store";
import { useDisplayUser } from "@/lib/useDisplayUser";

/** Build a profile from legacy app skills when AI onboarding was not completed */
export function profileFromAppSkills(app: AppState): StudentProfile {
  const skills = app.skills.length ? app.skills : ["design"];
  return {
    interests: skills,
    skills: skills.join(", "),
    goals: ["Freelance income", "Side hustle"],
    hoursPerDay: 2,
    incomeTarget: 10000,
    level: app.level === "Pro" ? "Advanced" : app.level === "Intermediate" ? "Intermediate" : "Beginner",
    tools: "",
    language: "English",
    workStyle: "Remote",
    priorities: ["Fast earning"],
  };
}

export function useMatchedOpportunities(appState?: AppState): {
  plan: AiOpportunityPlan | null;
  source: "ai-coach" | "skills" | null;
} {
  const { state: coach } = useAiCoachState();
  const me = useDisplayUser();

  return useMemo(() => {
    const city = me.city || appState?.user.city || "India";
    const name = me.name || appState?.user.name || "Student";

    if (coach.onboardingComplete) {
      return { plan: buildRecommendations(coach.profile, city, name), source: "ai-coach" as const };
    }

    if (appState?.skills.length) {
      const profile = profileFromAppSkills(appState);
      return { plan: buildRecommendations(profile, city, name), source: "skills" as const };
    }

    return { plan: null, source: null };
  }, [coach.onboardingComplete, coach.profile, appState?.skills, appState?.level, appState?.user.city, me.city, me.name]);
}
