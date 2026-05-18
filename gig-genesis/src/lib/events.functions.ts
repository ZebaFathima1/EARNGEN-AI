import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { aggregateLiveEvents } from "@/lib/events/aggregate";
import { resolveCoords } from "@/lib/events/geo";
import { rankEvents } from "@/lib/events/match-engine";
import type { EventsProfile, LiveEventsResponse } from "@/lib/events/types";

const ProfileSchema = z.object({
  interests: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  city: z.string().default("India"),
  level: z.string().default("Beginner"),
  hoursPerDay: z.number().default(2),
  incomeTarget: z.number().default(10000),
});

export const getLiveEvents = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        profile: ProfileSchema,
        filter: z.enum(["all", "online", "offline", "hackathon", "internship", "startup"]).optional(),
        limit: z.number().min(1).max(80).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<LiveEventsResponse> => {
    const start = Date.now();
    const profile = data.profile as EventsProfile;
    const { events: raw, sources } = await aggregateLiveEvents(profile.city);

    let ranked = rankEvents(raw, profile);

    if (data.filter === "online") ranked = ranked.filter((e) => e.isOnline);
    if (data.filter === "offline") ranked = ranked.filter((e) => !e.isOnline);
    if (data.filter === "hackathon") ranked = ranked.filter((e) => e.type === "hackathon");
    if (data.filter === "internship") ranked = ranked.filter((e) => e.type === "internship");
    if (data.filter === "startup")
      ranked = ranked.filter((e) => ["startup_event", "demo_day", "networking", "community"].includes(e.type));

    const limit = data.limit ?? 40;
    const coords = resolveCoords(profile.city);

    return {
      events: ranked.slice(0, limit),
      fetchedAt: new Date().toISOString(),
      sources,
      userCoords: coords,
      refreshedInMs: Date.now() - start,
    };
  });
