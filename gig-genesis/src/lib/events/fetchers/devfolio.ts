import type { LiveEvent } from "../types";

type DevfolioHack = {
  uuid: string;
  name: string;
  slug: string;
  tagline?: string;
  desc?: string;
  is_online?: boolean;
  private?: boolean;
  city?: string | null;
  country?: string | null;
  location?: string;
  starts_at?: string;
  ends_at?: string;
  participants_count?: number;
  themes?: { name: string }[];
  prizes?: { name: string; desc?: string; amount?: string | null }[];
  hackathon_setting?: {
    subdomain?: string;
    reg_starts_at?: string;
    reg_ends_at?: string;
    location_latitude?: number | null;
    location_longitude?: number | null;
  };
  cover_img?: string;
};

function prizeSummary(prizes?: DevfolioHack["prizes"]): string | undefined {
  if (!prizes?.length) return undefined;
  const top = prizes.find((p) => p.amount && Number(p.amount) > 0);
  if (top?.amount) return `₹${Math.round(Number(top.amount)).toLocaleString("en-IN")}+ pool`;
  const desc = prizes[0]?.desc;
  if (desc && desc.length < 120) return desc;
  return prizes[0]?.name;
}

function isRegistrationOpen(h: DevfolioHack, now: number): boolean {
  const regEnd = h.hackathon_setting?.reg_ends_at ? new Date(h.hackathon_setting.reg_ends_at).getTime() : 0;
  const ends = h.ends_at ? new Date(h.ends_at).getTime() : 0;
  if (regEnd > now) return true;
  if (ends > now && regEnd === 0) return true;
  return false;
}

function mapHack(h: DevfolioHack, ongoing: boolean): LiveEvent | null {
  if (h.private) return null;

  const subdomain = h.hackathon_setting?.subdomain ?? h.slug;
  const tags = [...(h.themes?.map((t) => t.name) ?? []), h.is_online ? "online" : "offline", "hackathon"];

  return {
    id: `devfolio-${h.uuid}`,
    source: "devfolio",
    title: h.name,
    organizer: "Devfolio",
    type: "hackathon",
    description: ongoing
      ? `Registration open — ${(h.tagline ?? h.desc ?? "").slice(0, 280)}`
      : (h.desc ?? h.tagline ?? "").slice(0, 400),
    tagline: ongoing ? "Apply now — registration open" : h.tagline,
    applyUrl: `https://${subdomain}.devfolio.co`,
    coverImage: h.cover_img,
    prizePool: prizeSummary(h.prizes),
    skillTags: tags,
    registrationDeadline: h.hackathon_setting?.reg_ends_at,
    startsAt: h.starts_at,
    endsAt: h.ends_at,
    isOnline: Boolean(h.is_online),
    venue: h.location ?? undefined,
    city: h.city ?? undefined,
    country: h.country ?? undefined,
    lat: h.hackathon_setting?.location_latitude ?? undefined,
    lng: h.hackathon_setting?.location_longitude ?? undefined,
    matchPercent: 0,
    trendingScore: ongoing ? 95 : Math.min(70, 30 + (h.participants_count ?? 0) / 30),
    participantsCount: h.participants_count,
  };
}

/** Only returns hackathons with registration still open (scans multiple API pages). */
export async function fetchDevfolioHackathons(maxPages = 12): Promise<LiveEvent[]> {
  const open: LiveEvent[] = [];
  const now = Date.now();

  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`https://api.devfolio.co/api/hackathons/?page=${page}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) break;
    const data = (await res.json()) as { result?: DevfolioHack[] };
    const batch = data.result ?? [];
    if (!batch.length) break;

    for (const h of batch) {
      if (!isRegistrationOpen(h, now)) continue;
      const mapped = mapHack(h, true);
      if (mapped) open.push(mapped);
    }
  }

  return open.sort((a, b) => {
    const da = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : Infinity;
    const db = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : Infinity;
    return da - db;
  });
}
