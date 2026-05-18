export type LiveEventType =
  | "hackathon"
  | "startup_event"
  | "ai_conference"
  | "coding_competition"
  | "workshop"
  | "internship"
  | "networking"
  | "creator"
  | "demo_day"
  | "community"
  | "meetup";

export type LiveEvent = {
  id: string;
  source: "devfolio" | "unstop" | "eventbrite" | "meetup" | "earngen";
  title: string;
  organizer: string;
  type: LiveEventType;
  description: string;
  tagline?: string;
  applyUrl: string;
  coverImage?: string;
  prizePool?: string;
  skillTags: string[];
  registrationDeadline?: string;
  startsAt?: string;
  endsAt?: string;
  isOnline: boolean;
  venue?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  matchPercent: number;
  trendingScore: number;
  participantsCount?: number;
  teamSize?: string;
  recommendedTeammates?: string[];
};

export type EventsProfile = {
  interests: string[];
  skills: string[];
  goals: string[];
  city: string;
  level: string;
  hoursPerDay: number;
  incomeTarget: number;
};

export type LiveEventsResponse = {
  events: LiveEvent[];
  fetchedAt: string;
  sources: { name: string; count: number; ok: boolean }[];
  userCoords?: { lat: number; lng: number };
  refreshedInMs: number;
};
