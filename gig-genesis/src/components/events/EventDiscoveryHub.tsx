import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveEvents } from "@/lib/events.functions";
import { buildEventsProfile } from "@/lib/events/build-profile";
import { useAppState } from "@/lib/store";
import { useAiCoachState } from "@/lib/ai-coach/store";
import { useDisplayUser } from "@/lib/useDisplayUser";
import { FeatureHero } from "@/components/platform/FeatureHero";
import { GlassCard } from "@/components/platform/GlassCard";
import { EventCard } from "./EventCard";
import { LiveMap } from "./LiveMap";
import { HackathonAssistant } from "./HackathonAssistant";
import { DirectApplyLinks } from "./DirectApplyLinks";
import { ONGOING_PORTAL_LINKS } from "@/lib/events/ongoing-portals";
import { cn } from "@/lib/utils";
import { Activity, MapPin, RefreshCw, Sparkles, TrendingUp, Users } from "lucide-react";

type Filter = "all" | "online" | "offline" | "hackathon" | "internship" | "startup";
type Tab = "events" | "map" | "talent";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All live" },
  { id: "hackathon", label: "Hackathons" },
  { id: "internship", label: "Internships" },
  { id: "startup", label: "Startup" },
  { id: "online", label: "Online" },
  { id: "offline", label: "In-person" },
];

export function EventDiscoveryHub() {
  const fetchEvents = useServerFn(getLiveEvents);
  const { state: app } = useAppState();
  const { state: coach } = useAiCoachState();
  const me = useDisplayUser();
  const city = me.city || app.user.city || "India";

  const profile = useMemo(() => buildEventsProfile(app, coach, city), [app, coach, city]);

  const [filter, setFilter] = useState<Filter>("all");
  const [tab, setTab] = useState<Tab>("events");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [planEventId, setPlanEventId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["live-events", profile, filter],
    queryFn: () => fetchEvents({ data: { profile, filter: filter === "all" ? undefined : filter, limit: 48 } }),
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
  });

  const events = data?.events ?? [];

  const portalLinks = useMemo(() => {
    const fromApi = events.filter((e) => e.id.startsWith("portal-"));
    return fromApi.length ? fromApi : ONGOING_PORTAL_LINKS;
  }, [events]);

  const filteredPortals = useMemo(() => {
    if (filter === "all") return portalLinks;
    if (filter === "online") return portalLinks.filter((e) => e.isOnline);
    if (filter === "offline") return portalLinks.filter((e) => !e.isOnline);
    if (filter === "hackathon") return portalLinks.filter((e) => e.type === "hackathon" || e.type === "coding_competition");
    if (filter === "internship") return portalLinks.filter((e) => e.type === "internship");
    if (filter === "startup")
      return portalLinks.filter((e) =>
        ["startup_event", "networking", "community", "workshop", "demo_day"].includes(e.type),
      );
    return portalLinks;
  }, [portalLinks, filter]);

  const individualEvents = useMemo(() => events.filter((e) => !e.id.startsWith("portal-")), [events]);

  const selected = individualEvents.find((e) => e.id === selectedId) ?? individualEvents[0];
  const planEvent = individualEvents.find((e) => e.id === planEventId);
  const heat = Math.min(1, events.length / 30);

  const trending = useMemo(
    () => [...portalLinks, ...individualEvents].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 5),
    [portalLinks, individualEvents],
  );

  return (
    <>
      <FeatureHero
        badge="Live intelligence"
        title="Nearby Events & Hackathons OS"
        subtitle="Direct links to ongoing hackathons and internships on Devfolio, Unstop, HackerEarth, and more — plus open registrations matched to your profile."
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 glass-panel rounded-lg px-3 py-2 text-sm font-semibold hover:ring-brand/40"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            {isFetching ? "Refreshing…" : "Refresh live"}
          </button>
          {data?.fetchedAt ? (
            <span className="text-xs text-muted-foreground self-center">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              {data.refreshedInMs ? ` · ${data.refreshedInMs}ms` : ""}
            </span>
          ) : null}
        </div>
      </FeatureHero>

      {data?.sources?.length ? (
        <div className="flex flex-wrap gap-2 mb-6">
          {data.sources.map((s) => (
            <span
              key={s.name}
              className={cn(
                "text-[10px] font-semibold rounded-full px-2.5 py-1 ring-1",
                s.ok ? "bg-brand/10 text-brand ring-brand/20" : "bg-muted text-muted-foreground ring-border",
              )}
            >
              {s.name} {s.ok ? `· ${s.count}` : "· offline"}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2 mb-4 border-b border-border pb-2">
        {(
          [
            { id: "events" as const, label: "Live events", icon: Sparkles },
            { id: "map" as const, label: "Map", icon: MapPin },
            { id: "talent" as const, label: "Talent nearby", icon: Users },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition",
              tab === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "talent" ? (
        <GlassCard className="p-8 text-center">
          <Users className="size-10 text-brand mx-auto mb-3" />
          <p className="font-semibold">Collaborator discovery</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Enable location sharing in Network to find peers near you. Event matches above include suggested teammate roles.
          </p>
          <Link to="/network" className="inline-block mt-4 text-sm font-semibold text-brand hover:underline">
            Open Network hub →
          </Link>
        </GlassCard>
      ) : null}

      {tab !== "talent" ? (
        <>
          <DirectApplyLinks portals={filteredPortals} />

          {individualEvents.length > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Individual hackathons — registration open now
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "text-xs font-semibold rounded-full px-3 py-1.5 ring-1 transition",
                  filter === f.id ? "bg-brand text-brand-foreground ring-brand" : "ring-border hover:ring-brand/30",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className={cn("space-y-4", tab === "map" ? "lg:col-span-2" : "lg:col-span-2")}>
              {tab === "map" ? (
                <LiveMap
                  events={events}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  heatIntensity={heat}
                />
              ) : null}

              {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : individualEvents.length === 0 && !isLoading ? (
                <GlassCard className="p-6 text-center">
                  <p className="font-semibold text-sm">No individual open registrations in API right now</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use the direct platform links above — they always list ongoing hackathons and internships.
                  </p>
                </GlassCard>
              ) : tab === "events" ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {individualEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      selected={selectedId === ev.id}
                      onSelect={() => setSelectedId(ev.id)}
                      onHackathonPlan={() => setPlanEventId(ev.id)}
                    />
                  ))}
                </div>
              ) : selected ? (
                <EventCard
                  event={selected}
                  selected
                  onHackathonPlan={() => setPlanEventId(selected.id)}
                />
              ) : null}
            </div>

            <aside className="space-y-4">
              {planEvent ? (
                <HackathonAssistant
                  event={planEvent}
                  skills={profile.skills}
                  interests={profile.interests}
                  level={profile.level}
                  onClose={() => setPlanEventId(null)}
                />
              ) : null}

              <GlassCard glow className="p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-2">
                  <TrendingUp className="size-4" /> Trending now
                </h3>
                <ul className="mt-3 space-y-2">
                  {trending.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(e.id)}
                        className="w-full text-left text-sm font-medium hover:text-brand line-clamp-1"
                      >
                        {e.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Activity className="size-4" /> Live activity feed
                </h3>
                <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto text-xs text-muted-foreground">
                  {events.slice(0, 8).map((e) => (
                    <li key={e.id} className="flex justify-between gap-2 py-1 border-b border-border last:border-0">
                      <span className="line-clamp-1">{e.title}</span>
                      <span className="text-brand font-semibold shrink-0">{e.matchPercent}%</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {!coach.onboardingComplete ? (
                <GlassCard className="p-4 text-xs">
                  <p className="font-semibold text-foreground">Boost AI match accuracy</p>
                  <p className="text-muted-foreground mt-1">Complete onboarding so we rank events for AI + Design + your earning goals.</p>
                  <Link to="/speak-with-ai" className="text-brand font-semibold mt-2 inline-block">
                    Personalize →
                  </Link>
                </GlassCard>
              ) : null}
            </aside>
          </div>
        </>
      ) : null}
    </>
  );
}
