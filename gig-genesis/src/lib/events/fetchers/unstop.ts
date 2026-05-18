import type { LiveEvent } from "../types";

/** Unstop public search — best-effort; returns [] if API shape changes */
export async function fetchUnstopOpportunities(city: string): Promise<LiveEvent[]> {
  try {
    const res = await fetch("https://unstop.com/api/public/opportunity/v2/search/opportunity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        page: 1,
        per_page: 24,
        opportunity: ["hackathons", "internships", "competitions"],
        sort: "recent",
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: {
        data?: Array<{
          id: number;
          title?: string;
          organisation_name?: string;
          type?: string;
          banner?: string;
          public_url?: string;
          registration_end_date?: string;
          start_date?: string;
          end_date?: string;
          mode?: string;
          location?: string;
          perks?: string;
        }>;
      };
    };

    const rows = data.data?.data ?? [];
    return rows.map((row) => {
      const typeRaw = (row.type ?? "").toLowerCase();
      let type: LiveEvent["type"] = "hackathon";
      if (typeRaw.includes("intern")) type = "internship";
      else if (typeRaw.includes("competition")) type = "coding_competition";
      else if (typeRaw.includes("workshop")) type = "workshop";

      return {
        id: `unstop-${row.id}`,
        source: "unstop",
        title: row.title ?? "Unstop opportunity",
        organizer: row.organisation_name ?? "Unstop",
        type,
        description: row.perks ?? `Opportunity on Unstop · ${city}`,
        applyUrl: row.public_url ?? `https://unstop.com/hackathons`,
        coverImage: row.banner,
        prizePool: row.perks?.slice(0, 80),
        skillTags: [type, row.mode ?? "hybrid"],
        registrationDeadline: row.registration_end_date,
        startsAt: row.start_date,
        endsAt: row.end_date,
        isOnline: (row.mode ?? "").toLowerCase().includes("virtual") || (row.mode ?? "").toLowerCase().includes("online"),
        venue: row.location,
        city,
        country: "India",
        matchPercent: 0,
        trendingScore: 55,
      } satisfies LiveEvent;
    });
  } catch {
    return [];
  }
}
