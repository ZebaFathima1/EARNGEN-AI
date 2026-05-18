import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Card } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAppState } from "@/lib/store";
import { useMatchedOpportunities } from "@/lib/ai-coach/useMatchedOpportunities";
import type { MatchedOpportunity } from "@/lib/ai-coach/types";
import type { OpportunityType } from "@/lib/ai-coach/opportunities-catalog";
import { cn } from "@/lib/utils";
import { ExternalLink, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "AI Opportunities — EARNGEN-AI" },
      {
        name: "description",
        content:
          "Personalized income opportunities ranked by match score, earning potential, and your profile. Same matches as your AI career dashboard.",
      },
    ],
  }),
  component: Opportunities,
});

const FILTERS: { id: string; label: string; types?: OpportunityType[] }[] = [
  { id: "all", label: "All" },
  { id: "freelance", label: "Freelance", types: ["freelance_gig", "creator", "passive"] },
  { id: "internship", label: "Internships", types: ["internship"] },
  { id: "hackathon", label: "Hackathons", types: ["hackathon", "competition"] },
  { id: "remote", label: "Remote jobs", types: ["remote_job"] },
  { id: "startup", label: "Startup", types: ["startup_program", "community"] },
  { id: "nearby", label: "Nearby", types: ["nearby", "scholarship"] },
];

const TYPE_LABEL: Record<string, string> = {
  freelance_gig: "Freelance",
  internship: "Internship",
  hackathon: "Hackathon",
  remote_job: "Remote",
  startup_program: "Startup",
  community: "Community",
  scholarship: "Scholarship",
  competition: "Competition",
  creator: "Creator",
  passive: "Passive",
  nearby: "Nearby",
};

function Opportunities() {
  const { state, setSprint } = useAppState();
  const { plan, source } = useMatchedOpportunities(state);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const visible = useMemo(() => {
    if (!plan) return [];
    const f = FILTERS.find((x) => x.id === filter);
    if (!f?.types) return plan.opportunityMatches;
    return plan.opportunityMatches.filter((o) => f.types!.includes(o.type));
  }, [plan, filter]);

  function startSprint(opp: MatchedOpportunity) {
    const gig = plan?.gigs.find((g) => opp.id === `gig-${g.id}`);
    if (gig) {
      setSprint({ gigTitle: gig.title, startedAt: new Date().toISOString(), completedDays: [] });
      navigate({ to: "/sprint" });
    }
  }

  return (
    <Shell>
      <RequireAuth>
        <header className="mb-8 fade-up">
          <p className="text-sm text-brand font-semibold uppercase tracking-wider">AI Opportunity OS</p>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">
            {plan ? plan.headline : "Income opportunities for your stack"}
          </h1>
          <p className="text-muted-foreground mt-2 text-pretty max-w-2xl">
            {plan
              ? plan.summary
              : "Complete Speak with AI onboarding to unlock personalized matches — or add skills on your dashboard."}
          </p>
          {plan ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs font-semibold rounded-full px-3 py-1 bg-brand/10 text-brand ring-1 ring-brand/20">
                {plan.opportunityMatches.length} matches
              </span>
              <span className="text-xs font-semibold rounded-full px-3 py-1 bg-muted ring-1 ring-border">
                {plan.confidence}% confidence
              </span>
              <span className="text-xs font-semibold rounded-full px-3 py-1 bg-muted ring-1 ring-border">
                ₹{plan.earningMin.toLocaleString("en-IN")}–{plan.earningMax.toLocaleString("en-IN")}/mo path
              </span>
              {source === "ai-coach" ? (
                <span className="text-xs font-medium rounded-full px-3 py-1 bg-chart-2/10 text-chart-2 ring-1 ring-chart-2/20 flex items-center gap-1">
                  <Sparkles className="size-3" /> Synced from Speak with AI
                </span>
              ) : null}
            </div>
          ) : null}
        </header>

        {!plan ? (
          <Card className="p-10 text-center">
            <p className="font-semibold">No personalized matches yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Go to <strong className="text-foreground">Speak with AI</strong>, complete the 4-step onboarding, and every
              opportunity from your AI dashboard will appear here automatically.
            </p>
            <Link
              to="/speak-with-ai"
              className="inline-flex mt-6 bg-brand text-brand-foreground font-semibold px-5 py-2.5 rounded-lg hover:brightness-105"
            >
              Open Speak with AI →
            </Link>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "text-sm font-medium rounded-lg px-3 py-1.5 ring-1 transition-colors",
                    filter === f.id
                      ? "bg-foreground text-background ring-foreground"
                      : "bg-card text-muted-foreground ring-border hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground text-sm">
                No opportunities in this filter. Try &quot;All&quot; or retake onboarding in Speak with AI.
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {visible.map((opp, i) => (
                  <Card
                    key={opp.id}
                    className="p-5 fade-up hover:ring-brand/30 transition-shadow relative overflow-hidden"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="absolute top-3 right-3 flex flex-col items-center">
                      <span className="text-lg font-bold text-brand">{opp.matchPercent}%</span>
                      <span className="text-[9px] uppercase text-muted-foreground">match</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2 pr-14">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-brand">
                        {TYPE_LABEL[opp.type] ?? opp.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{opp.platform}</span>
                      <DifficultyBadge d={opp.difficulty} />
                    </div>
                    <h3 className="font-semibold text-base pr-12">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-pretty line-clamp-2">{opp.description}</p>
                    <p className="text-xs text-foreground/80 mt-2 line-clamp-2 border-l-2 border-brand/30 pl-2">
                      {opp.howToEarn}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground">
                      <span>
                        ₹{opp.minEarning.toLocaleString("en-IN")} – ₹{opp.maxEarning.toLocaleString("en-IN")}/mo
                      </span>
                      <span>~{opp.daysToAchieve}d to start</span>
                      <span>{opp.successChance}% success est.</span>
                      {opp.remote ? <span>Remote</span> : null}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <a
                        href={opp.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90"
                      >
                        Apply on {opp.platform} <ExternalLink className="size-3" />
                      </a>
                      {opp.id.startsWith("gig-") ? (
                        <button
                          type="button"
                          onClick={() => startSprint(opp)}
                          className="text-xs font-semibold rounded-md ring-1 ring-brand text-brand px-3 py-1.5 hover:bg-brand/10"
                        >
                          7-day sprint →
                        </button>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {plan.nearbyEvents.length > 0 ? (
              <section className="mt-10 fade-up">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <MapPin className="size-5 text-brand" /> Nearby events & communities
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plan.nearbyEvents.map((ev) => (
                    <Card key={ev.id} className="p-4">
                      <div className="flex justify-between gap-2">
                        <p className="font-medium text-sm">{ev.title}</p>
                        <span className="text-[10px] font-bold text-brand shrink-0">{ev.matchPercent}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ev.venue} · {ev.date} · {ev.distanceKm} km
                      </p>
                    </Card>
                  ))}
                </div>
                <Link to="/nearby" className="inline-block mt-4 text-sm font-semibold text-brand hover:underline">
                  Open full nearby map →
                </Link>
              </section>
            ) : null}

            {plan.platformRecommendations.length > 0 ? (
              <section className="mt-10 fade-up">
                <h2 className="text-lg font-semibold mb-4">Recommended platforms</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {plan.platformRecommendations.map((pl) => (
                    <a
                      key={pl.name}
                      href={pl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-panel rounded-xl p-4 ring-1 ring-border hover:ring-brand/40 transition group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{pl.name}</span>
                        <span className="text-xs font-bold text-brand">{pl.matchPercent}%</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 line-clamp-3 group-hover:text-foreground/80">
                        {pl.why}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="mt-8 text-center">
              <Link
                to="/speak-with-ai"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Refine matches in Speak with AI →
              </Link>
            </div>
          </>
        )}
      </RequireAuth>
    </Shell>
  );
}

function DifficultyBadge({ d }: { d: string }) {
  return (
    <span
      className={cn(
        "text-[9px] font-semibold px-1.5 py-0.5 rounded",
        d === "Easy" && "bg-brand/15 text-brand",
        d === "Medium" && "bg-chart-3/15 text-chart-3",
        d === "Hard" && "bg-destructive/10 text-destructive",
      )}
    >
      {d}
    </span>
  );
}
