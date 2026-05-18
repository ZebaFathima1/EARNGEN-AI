import type { Gig } from "@/lib/ai";
import type { OpportunityType } from "./opportunities-catalog";

export const INTEREST_OPTIONS = [
  "AI",
  "Design",
  "Coding",
  "Editing",
  "Writing",
  "Marketing",
  "Content creation",
  "Business",
  "Other",
] as const;

export const GOAL_OPTIONS = [
  "Freelance income",
  "Internship",
  "Startup",
  "Passive income",
  "Remote job",
  "Side hustle",
] as const;

export const PRIORITY_OPTIONS = [
  "Fast earning",
  "Long-term growth",
  "Startup building",
  "Personal brand",
] as const;

export const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;

export type StudentProfile = {
  interests: string[];
  skills: string;
  goals: string[];
  hoursPerDay: number;
  incomeTarget: number;
  level: (typeof LEVEL_OPTIONS)[number];
  tools: string;
  language: string;
  workStyle: string;
  priorities: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type MatchedOpportunity = {
  id: string;
  title: string;
  type: OpportunityType;
  platform: string;
  description: string;
  howToEarn: string;
  minEarning: number;
  maxEarning: number;
  difficulty: "Easy" | "Medium" | "Hard";
  daysToAchieve: number;
  applyUrl: string;
  matchPercent: number;
  successChance: number;
  remote: boolean;
};

export type PlatformRecommendation = {
  name: string;
  url: string;
  matchPercent: number;
  why: string;
};

export type NearbyEvent = {
  id: string;
  title: string;
  type: OpportunityType;
  distanceKm: number;
  date: string;
  venue: string;
  matchPercent: number;
};

export type TimelineMilestone = {
  label: string;
  earningTarget: number;
  milestones: string[];
  topOpportunityId?: string;
};

export type SmartSuggestions = {
  focusOn: string[];
  avoid: string[];
  highestEarningPath: string;
  bestSkillNext: string;
  fastestIncome: string;
};

/** Full actionable plan from opportunity mapping engine */
export type AiOpportunityPlan = {
  headline: string;
  summary: string;
  confidence: number;
  earningMin: number;
  earningMax: number;
  skillScore: number;
  opportunityMatches: MatchedOpportunity[];
  platformRecommendations: PlatformRecommendation[];
  nearbyEvents: NearbyEvent[];
  timeline: TimelineMilestone[];
  smartSuggestions: SmartSuggestions;
  gigs: Gig[];
  opportunitySummaryForChat: string;
};

/** @deprecated use AiOpportunityPlan — kept for gradual migration */
export type AiRecommendations = AiOpportunityPlan;
