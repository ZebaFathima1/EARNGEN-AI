import { haversineKm, resolveCoords } from "./geo";
import type { EventsProfile, LiveEvent, LiveEventType } from "./types";

function tokens(p: EventsProfile): string[] {
  return [
    ...p.interests,
    ...p.skills,
    ...p.goals,
    p.level,
    p.city,
  ]
    .join(" ")
    .toLowerCase()
    .split(/[\s,.\n/+#]+/)
    .filter((t) => t.length >= 2);
}

function typeBoost(goals: string[], type: LiveEventType): number {
  if (goals.some((g) => g.toLowerCase().includes("startup")) && ["startup_event", "demo_day", "hackathon"].includes(type))
    return 14;
  if (goals.some((g) => g.toLowerCase().includes("intern")) && type === "internship") return 16;
  if (goals.some((g) => g.toLowerCase().includes("freelance")) && ["workshop", "creator"].includes(type)) return 8;
  return 0;
}

export function scoreEvent(event: LiveEvent, profile: EventsProfile, userLat: number, userLng: number): LiveEvent {
  const tok = tokens(profile);
  const blob = `${event.title} ${event.description} ${event.tagline ?? ""} ${event.skillTags.join(" ")}`.toLowerCase();

  let score = 48 + event.trendingScore * 0.2;
  for (const t of tok) {
    if (blob.includes(t)) score += 8;
  }
  score += typeBoost(profile.goals, event.type);

  if (profile.interests.some((i) => i.toLowerCase().includes("ai")) && blob.match(/ai|ml|gpt|llm|machine/)) score += 12;
  if (profile.interests.some((i) => i.toLowerCase().includes("design")) && blob.match(/design|ui|ux|figma/)) score += 10;

  if (event.lat != null && event.lng != null) {
    const d = haversineKm(userLat, userLng, event.lat, event.lng);
    event.distanceKm = Math.round(d * 10) / 10;
    if (d <= 25) score += 15;
    else if (d <= 100) score += 8;
    else if (event.isOnline) score += 6;
  } else if (event.isOnline) {
    score += 10;
    event.distanceKm = undefined;
  } else if (event.city && profile.city && event.city.toLowerCase().includes(profile.city.toLowerCase().slice(0, 4))) {
    score += 12;
    event.distanceKm = Math.round(5 + Math.random() * 15);
  }

  const reg = event.registrationDeadline ? new Date(event.registrationDeadline).getTime() : 0;
  if (reg > Date.now() && reg < Date.now() + 86400000 * 7) score += 8;

  event.matchPercent = Math.min(98, Math.max(52, Math.round(score)));
  event.recommendedTeammates = suggestTeammates(profile, event);
  return event;
}

function suggestTeammates(profile: EventsProfile, event: LiveEvent): string[] {
  const skills = profile.skills.length ? profile.skills.slice(0, 2) : profile.interests.slice(0, 2);
  const need =
    event.type === "hackathon"
      ? ["Full-stack dev", "UI designer", "Pitch lead"]
      : event.type === "startup_event"
        ? ["Growth marketer", "Product builder"]
        : ["Mentor", "Peer collaborator"];
  return [...skills.map((s) => `${s} specialist`), ...need].slice(0, 3);
}

export function rankEvents(events: LiveEvent[], profile: EventsProfile): LiveEvent[] {
  const { lat, lng } = resolveCoords(profile.city);
  return events
    .map((e) => {
      const scored = scoreEvent({ ...e }, profile, lat, lng);
      if (e.id.startsWith("portal-")) {
        scored.matchPercent = Math.max(scored.matchPercent, 88);
      }
      return scored;
    })
    .sort((a, b) => {
      const aPortal = a.id.startsWith("portal-") ? 1 : 0;
      const bPortal = b.id.startsWith("portal-") ? 1 : 0;
      if (aPortal !== bPortal) return bPortal - aPortal;
      return b.matchPercent - a.matchPercent;
    });
}
