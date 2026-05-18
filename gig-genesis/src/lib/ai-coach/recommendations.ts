import type { StudentProfile } from "./types";
import { buildOpportunityPlan } from "./opportunity-engine";

export function buildRecommendations(profile: StudentProfile, city = "India", name = "there") {
  return buildOpportunityPlan(profile, city, name);
}
