import { suggestGigs, gigApplyLinks, type Gig } from "@/lib/ai";
import type { StudentProfile } from "./types";
import type { AiOpportunityPlan } from "./types";
import {
  NEARBY_EVENTS_CATALOG,
  OPPORTUNITY_CATALOG,
  PLATFORM_CATALOG,
  type CatalogOpportunity,
  type OpportunityType,
} from "./opportunities-catalog";

function profileTokens(p: StudentProfile): string[] {
  const raw = [
    ...p.interests,
    ...p.goals,
    ...p.priorities,
    ...p.skills.toLowerCase().split(/[\s,.\n/]+/),
    ...p.tools.toLowerCase().split(/[\s,.\n/]+/),
    p.level.toLowerCase(),
    p.workStyle.toLowerCase(),
  ];
  return Array.from(new Set(raw.map((t) => t.trim()).filter((t) => t.length >= 2)));
}

function tagOverlap(tokens: string[], tags: string[]): number {
  let score = 0;
  for (const tag of tags) {
    const t = tag.toLowerCase();
    if (tokens.some((tok) => tok.includes(t) || t.includes(tok))) score += 1;
  }
  return score;
}

function levelFit(level: StudentProfile["level"], diff: CatalogOpportunity["difficulty"]): number {
  if (level === "Beginner" && diff === "Easy") return 12;
  if (level === "Beginner" && diff === "Hard") return -15;
  if (level === "Advanced" && diff === "Easy") return -5;
  if (level === "Advanced" && diff === "Hard") return 8;
  return 5;
}

function goalBoost(goals: string[], type: OpportunityType): number {
  if (goals.includes("Internship") && type === "internship") return 18;
  if (goals.includes("Startup") && (type === "startup_program" || type === "hackathon")) return 16;
  if (goals.includes("Freelance income") && type === "freelance_gig") return 14;
  if (goals.includes("Remote job") && type === "remote_job") return 12;
  if (goals.includes("Side hustle") && (type === "freelance_gig" || type === "creator")) return 10;
  if (goals.includes("Passive income") && type === "passive") return 14;
  return 0;
}

function priorityBoost(priorities: string[], opp: CatalogOpportunity): number {
  if (priorities.includes("Fast earning") && opp.daysToAchieve <= 7) return 12;
  if (priorities.includes("Long-term growth") && (opp.type === "internship" || opp.type === "remote_job")) return 10;
  if (priorities.includes("Startup building") && opp.type === "startup_program") return 14;
  if (priorities.includes("Personal brand") && (opp.type === "creator" || opp.type === "community")) return 10;
  return 0;
}

export function scoreOpportunity(tokens: string[], profile: StudentProfile, opp: CatalogOpportunity): number {
  const overlap = tagOverlap(tokens, opp.tags);
  let score = 42 + overlap * 9 + levelFit(profile.level, opp.difficulty) + goalBoost(profile.goals, opp.type);
  score += priorityBoost(profile.priorities, opp);
  if (profile.hoursPerDay <= 2 && opp.difficulty === "Hard") score -= 8;
  if (opp.minEarning <= profile.incomeTarget && opp.maxEarning >= profile.incomeTarget * 0.2) score += 6;
  return Math.min(97, Math.max(55, score));
}

function gigToOpportunity(g: Gig, profile: StudentProfile, tokens: string[]): CatalogOpportunity & { matchPercent: number; successChance: number } {
  const links = gigApplyLinks(g.title, "India");
  const base: CatalogOpportunity = {
    id: `gig-${g.id}`,
    title: g.title,
    type: "freelance_gig",
    platform: g.platforms[0] ?? "Fiverr",
    description: g.description,
    howToEarn: g.pitch,
    minEarning: g.minPrice,
    maxEarning: g.maxPrice,
    difficulty: g.difficulty,
    daysToAchieve: g.daysToFirstEarn,
    applyUrl: links.fiverr,
    tags: [...g.matchedSkills, g.category.toLowerCase(), "freelance"],
    remote: true,
  };
  const matchPercent = scoreOpportunity(tokens, profile, base);
  const successChance = Math.min(92, matchPercent - 5 + (g.difficulty === "Easy" ? 8 : 0));
  return { ...base, matchPercent, successChance };
}

export function buildOpportunityPlan(profile: StudentProfile, city = "India", name = "Student"): AiOpportunityPlan {
  const tokens = profileTokens(profile);
  const kw = tokens.filter((t) => t.length >= 3);
  const gigs = suggestGigs(kw.length ? kw : ["design", "ai"], city, name);

  const gigOpps = gigs.map((g) => gigToOpportunity(g, profile, tokens));

  const catalogScored = OPPORTUNITY_CATALOG.map((opp) => {
    const matchPercent = scoreOpportunity(tokens, profile, opp);
    const successChance = Math.min(
      94,
      matchPercent - 3 + (opp.difficulty === "Easy" ? 6 : opp.difficulty === "Hard" ? -8 : 0),
    );
    return { ...opp, matchPercent, successChance };
  });

  const seen = new Set<string>();
  const merged = [...gigOpps, ...catalogScored]
    .filter((o) => {
      const key = o.title.toLowerCase().slice(0, 24);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);

  const opportunityMatches = merged.slice(0, 10);

  const platformRecommendations = PLATFORM_CATALOG.map((pl) => {
    const overlap = tagOverlap(tokens, pl.tags);
    const matchPercent = Math.min(96, 50 + overlap * 12);
    const interest = profile.interests[0] ?? "your skills";
    return {
      name: pl.name,
      url: pl.url,
      matchPercent,
      why: pl.whyTemplate
        .replace("{level}", profile.level.toLowerCase())
        .replace("{interest}", interest)
        .replace("{city}", city),
    };
  })
    .filter((p) => p.matchPercent >= 58)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 8);

  const mult = profile.level === "Advanced" ? 1.35 : profile.level === "Intermediate" ? 1.15 : 1;
  const earningMin = Math.round(profile.incomeTarget * 0.25 * mult);
  const earningMax = Math.round(profile.incomeTarget * mult);

  const fastest = [...merged].sort((a, b) => a.daysToAchieve - b.daysToAchieve)[0];
  const highest = [...merged].sort((a, b) => b.maxEarning - a.maxEarning)[0];

  const timeline = [
    {
      label: "Week 1",
      earningTarget: Math.round(earningMin * 0.15),
      milestones: ["Lock 1 offer", "2 portfolio samples", `Profiles live on ${platformRecommendations[0]?.name ?? "Fiverr"}`],
      topOpportunityId: opportunityMatches[0]?.id,
    },
    {
      label: "Week 2",
      earningTarget: Math.round(earningMin * 0.35),
      milestones: ["15 outreach messages/day", "1 discovery call", "Apply to 3 internships/hackathons"],
      topOpportunityId: opportunityMatches[1]?.id,
    },
    {
      label: "Month 1",
      earningTarget: Math.round(earningMin * 0.7),
      milestones: ["First paid delivery", "Log Proof-of-Work", "Raise rates 15%"],
      topOpportunityId: opportunityMatches[2]?.id,
    },
    {
      label: "Month 3",
      earningTarget: Math.round((earningMin + earningMax) / 2),
      milestones: ["2 repeat clients", "1 retainer", "Hackathon or fellowship application"],
      topOpportunityId: opportunityMatches[3]?.id,
    },
    {
      label: "Month 6",
      earningTarget: earningMax,
      milestones: ["Predictable monthly pipeline", "Premium positioning", "Mentor others on Topmate"],
      topOpportunityId: opportunityMatches[4]?.id,
    },
  ];

  const nearbyEvents = NEARBY_EVENTS_CATALOG.map((e) => ({
    ...e,
    matchPercent: Math.min(95, 70 + tagOverlap(tokens, [e.type, "nearby", "community"])),
  }));

  const focusSkill =
    profile.interests.find((i) => !profile.skills.toLowerCase().includes(i.toLowerCase())) ??
    profile.interests[0] ??
    "client communication";

  return {
    headline: `${profile.interests.slice(0, 2).join(" + ") || "Skills"} → ${opportunityMatches.length} matched opportunities`,
    summary: `Mapped ${opportunityMatches.length} actionable paths for ${profile.level} level in ${city}, targeting ₹${profile.incomeTarget.toLocaleString("en-IN")}/mo with ${profile.hoursPerDay}h/day.`,
    confidence: Math.min(98, 65 + opportunityMatches.length * 2 + tokens.length * 2),
    earningMin,
    earningMax,
    skillScore: Math.min(100, 38 + tokens.length * 4 + (profile.skills.length > 30 ? 15 : 0)),
    opportunityMatches,
    platformRecommendations,
    nearbyEvents,
    timeline,
    smartSuggestions: {
      focusOn: [
        fastest ? `Start with "${fastest.title}" on ${fastest.platform} — live in ~${fastest.daysToAchieve} days` : "Pick one Easy freelance gig",
        `Double down on ${focusSkill} — highest leverage vs your current skills`,
        platformRecommendations[0] ? `Primary platform: ${platformRecommendations[0].name} (${platformRecommendations[0].matchPercent}% match)` : "Set up Fiverr first",
      ],
      avoid: [
        profile.level === "Beginner" ? "Avoid Hard gigs until you have 1 completed project" : "Don't underprice below ₹500/hour equivalent",
        profile.hoursPerDay <= 2 ? "Skip more than 2 active platforms at once" : "",
        profile.priorities.includes("Fast earning") ? "Long unpaid 'exposure' projects" : "Random skill hopping weekly",
      ].filter(Boolean),
      highestEarningPath: highest
        ? `${highest.title} via ${highest.platform} — up to ₹${highest.maxEarning.toLocaleString("en-IN")}/mo (${highest.matchPercent}% match)`
        : "Stack 2 retainers on Fiverr + Upwork",
      bestSkillNext: focusSkill,
      fastestIncome: fastest
        ? `${fastest.title} (${fastest.platform}) — ₹${fastest.minEarning.toLocaleString("en-IN")}+ in ~${fastest.daysToAchieve} days`
        : "AI thumbnail or Canva template packs",
    },
    gigs,
    opportunitySummaryForChat: opportunityMatches
      .slice(0, 6)
      .map(
        (o) =>
          `- ${o.title} (${o.platform}, ${o.matchPercent}% match, ₹${o.minEarning}-${o.maxEarning}, ${o.daysToAchieve}d): ${o.howToEarn}`,
      )
      .join("\n"),
  };
}
