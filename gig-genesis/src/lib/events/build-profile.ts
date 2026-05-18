import type { AppState } from "@/lib/store";
import type { StudentProfile } from "@/lib/ai-coach/types";
import type { EventsProfile } from "./types";

export function buildEventsProfile(
  app: AppState,
  coach?: { onboardingComplete: boolean; profile: StudentProfile },
  city = "India",
): EventsProfile {
  if (coach?.onboardingComplete) {
    const p = coach.profile;
    return {
      interests: p.interests,
      skills: [...p.skills.split(/[\s,]+/).filter(Boolean), ...app.skills],
      goals: p.goals,
      city: city || "India",
      level: p.level,
      hoursPerDay: p.hoursPerDay,
      incomeTarget: p.incomeTarget,
    };
  }
  return {
    interests: app.skills.length ? app.skills : ["AI", "Design"],
    skills: app.skills,
    goals: ["Freelance income", "Startup"],
    city: city || "India",
    level: app.level === "Pro" ? "Advanced" : app.level,
    hoursPerDay: 2,
    incomeTarget: 10000,
  };
}
