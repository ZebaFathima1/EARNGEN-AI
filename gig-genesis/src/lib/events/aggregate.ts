import type { LiveEvent } from "./types";
import { ONGOING_PORTAL_LINKS } from "./ongoing-portals";
import { fetchDevfolioHackathons } from "./fetchers/devfolio";
import { fetchUnstopOpportunities } from "./fetchers/unstop";

function dedupe(events: LiveEvent[]): LiveEvent[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    const key = e.applyUrl.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function aggregateLiveEvents(city: string): Promise<{
  events: LiveEvent[];
  sources: { name: string; count: number; ok: boolean }[];
}> {
  const sources: { name: string; count: number; ok: boolean }[] = [];

  const [devfolioOpen, unstop] = await Promise.all([
    fetchDevfolioHackathons(12).catch(() => []),
    fetchUnstopOpportunities(city).catch(() => []),
  ]);

  sources.push({ name: "Direct portals", count: ONGOING_PORTAL_LINKS.length, ok: true });
  sources.push({ name: "Devfolio (open reg.)", count: devfolioOpen.length, ok: devfolioOpen.length > 0 });
  sources.push({ name: "Unstop", count: unstop.length, ok: unstop.length > 0 });

  // Portals first — guaranteed ongoing listing URLs; then individual open registrations
  const events = dedupe([...ONGOING_PORTAL_LINKS, ...devfolioOpen, ...unstop]);

  return { events, sources };
}
