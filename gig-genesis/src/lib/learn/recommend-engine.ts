import type { StudentProfile } from "@/lib/ai-coach/types";
import { COURSE_CATALOG } from "./catalog";
import type { Course, LearnDashboard, LearnState, ScoredCourse } from "./types";

const INTEREST_MAP: Record<string, string[]> = {
  ai: ["Artificial Intelligence", "Prompt Engineering", "Data Science"],
  design: ["UI/UX Design", "Graphic Design"],
  startup: ["Startup Building", "Marketing", "Freelancing"],
  code: ["Web Development", "App Development", "Data Science", "Cybersecurity"],
  video: ["Video Editing", "Content Creation"],
  freelance: ["Freelancing", "Marketing"],
  content: ["Content Creation", "Marketing"],
  "no-code": ["No-Code Tools", "Artificial Intelligence"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,+/|&]+/)
    .filter((t) => t.length > 1);
}

export function scoreCourse(course: Course, profile: StudentProfile): ScoredCourse {
  const interests = profile.interests.map((i) => i.toLowerCase());
  const goals = profile.goals.map((g) => g.toLowerCase());
  const skills = tokenize(profile.skills);
  const tools = tokenize(profile.tools);
  const priorities = profile.priorities.map((p) => p.toLowerCase());

  let score = 40;
  const reasons: string[] = [];

  for (const interest of interests) {
    const cats = INTEREST_MAP[interest] ?? [];
    if (cats.includes(course.category)) {
      score += 18;
      reasons.push(`Matches your ${interest} interest`);
    }
    if (course.tags.some((t) => interest.includes(t) || t.includes(interest))) {
      score += 12;
      reasons.push(`Aligned with ${interest}`);
    }
  }

  for (const g of goals) {
    if (course.tags.some((t) => g.includes(t)) || course.title.toLowerCase().includes(g)) {
      score += 10;
      reasons.push(`Supports your goal: ${g}`);
    }
  }

  for (const s of skills) {
    if (course.tags.includes(s) || course.title.toLowerCase().includes(s)) {
      score += 8;
    }
  }

  for (const t of tools) {
    if (course.tags.some((tag) => tag.includes(t) || t.includes(tag))) {
      score += 6;
    }
  }

  if (profile.incomeTarget >= 50000 && course.earningTags.includes("freelance")) {
    score += 8;
    reasons.push("High-income freelance path");
  }
  if (profile.incomeTarget >= 100000 && course.earningTags.includes("startup")) {
    score += 6;
  }

  if (profile.level === "Beginner" && course.difficulty === "Beginner") score += 10;
  if (profile.level === "Advanced" && course.difficulty === "Advanced") score += 10;

  for (const p of priorities) {
    if (course.earningTags.some((e) => p.includes(e))) score += 5;
  }

  score += Math.min(15, course.rating * 2);
  score += course.views.includes("M") ? 5 : 2;

  const matchPercent = Math.min(99, Math.round(score));
  const whyMatch = reasons[0] ?? `Trending in ${course.category}`;

  return { ...course, matchPercent, whyMatch };
}

export function buildLearnDashboard(profile: StudentProfile, learn: LearnState): LearnDashboard {
  const scored = COURSE_CATALOG.map((c) => scoreCourse(c, profile)).sort((a, b) => b.matchPercent - a.matchPercent);

  const enrolledIds = Object.keys(learn.enrolled);
  const enrolled = scored.filter((c) => enrolledIds.includes(c.id));

  const continueLearning = enrolled
    .map((c) => {
      const e = learn.enrolled[c.id];
      const total = c.lessons.length || 1;
      const done = e?.completedLessonIds.length ?? 0;
      return { ...c, progress: Math.round((done / total) * 100) };
    })
    .filter((c) => c.progress < 100)
    .sort((a, b) => b.progress - a.progress);

  const trending = [...scored].sort((a, b) => {
    const av = parseFloat(b.views.replace(/[^\d.]/g, "")) - parseFloat(a.views.replace(/[^\d.]/g, ""));
    return av || b.rating - a.rating;
  }).slice(0, 8);

  const grouped = {} as LearnDashboard["byCategory"];
  for (const c of scored) {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  }

  const top = scored[0];
  const nextSkill = top ? `${top.category} · ${top.tags[0] ?? "practice"}` : "Prompt Engineering";

  const insight =
    profile.interests.length > 0
      ? `Based on ${profile.interests.slice(0, 2).join(" + ")}, focus on ${scored.slice(0, 3).map((c) => c.title.split(" ")[0]).join(", ")} then ship a portfolio project.`
      : "Complete Speak with AI onboarding for personalized course picks.";

  return {
    recommended: scored.slice(0, 12),
    trending: trending as ScoredCourse[],
    continueLearning,
    enrolled,
    byCategory: grouped,
    nextSkill,
    insight,
  };
}

export function suggestCreators(profile: StudentProfile): string[] {
  const scored = COURSE_CATALOG.map((c) => scoreCourse(c, profile));
  const creators = new Set<string>();
  scored.slice(0, 6).forEach((c) => creators.add(c.creator));
  return [...creators];
}
