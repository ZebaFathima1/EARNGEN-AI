import { Link, useNavigate } from "@tanstack/react-router";
import type { AiOpportunityPlan, MatchedOpportunity } from "@/lib/ai-coach/types";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Ban,
  Briefcase,
  Calendar,
  ExternalLink,
  Lightbulb,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

type Props = {
  data: AiOpportunityPlan;
  collapsed?: boolean;
  onToggle?: () => void;
};

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

export function RecommendationDashboard({ data, collapsed, onToggle }: Props) {
  const navigate = useNavigate();
  const { setSprint } = useAppState();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed right-4 bottom-24 z-40 rounded-full bg-gradient-to-r from-brand to-brand-light text-white px-4 py-2.5 text-xs font-semibold shadow-xl shadow-brand/30 lg:hidden"
      >
        {data.opportunityMatches.length} opportunities
      </button>
    );
  }

  const expanded = data.opportunityMatches.find((o) => o.id === expandedId);

  return (
    <aside className="space-y-4 overflow-y-auto max-h-[calc(100dvh-5rem)] pr-1 pb-10 scrollbar-thin">
      {/* Hero metrics */}
      <div className="glass-panel rounded-2xl p-5 ring-1 ring-brand/25 bg-gradient-to-br from-brand/10 via-card/80 to-chart-2/5 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand relative">AI opportunity OS</p>
        <h2 className="text-lg font-semibold mt-1 leading-snug relative">{data.headline}</h2>
        <p className="text-xs text-muted-foreground mt-2 relative">{data.summary}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 relative">
          <MetricPill label="Matches" value={String(data.opportunityMatches.length)} />
          <MetricPill label="Confidence" value={`${data.confidence}%`} />
          <MetricPill label="Earning path" value={`₹${data.earningMin.toLocaleString("en-IN")}+`} />
          <MetricPill label="Skill score" value={`${data.skillScore}/100`} />
        </div>
      </div>

      {/* Smart suggestions */}
      <Section title="Smart AI suggestions" icon={Lightbulb} glow>
        <SuggestionBlock title="You should focus on" items={data.smartSuggestions.focusOn} variant="focus" />
        <SuggestionBlock title="Avoid wasting time on" items={data.smartSuggestions.avoid} variant="avoid" />
        <div className="mt-3 space-y-2 text-xs">
          <Highlight label="Highest earning path" text={data.smartSuggestions.highestEarningPath} />
          <Highlight label="Fastest income" text={data.smartSuggestions.fastestIncome} icon={Zap} />
          <Highlight label="Best skill to learn next" text={data.smartSuggestions.bestSkillNext} icon={Target} />
        </div>
      </Section>

      {/* Opportunity matches */}
      <Section title="AI opportunity matches" icon={Briefcase} badge={`${data.opportunityMatches.length} live`}>
        <div className="space-y-3">
          {data.opportunityMatches.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              expanded={expandedId === opp.id}
              onToggle={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
              onSprint={() => {
                const g = data.gigs.find((x) => opp.id === `gig-${x.id}`);
                if (g) {
                  setSprint({ gigTitle: g.title, startedAt: new Date().toISOString(), completedDays: [] });
                  navigate({ to: "/sprint" });
                }
              }}
            />
          ))}
        </div>
      </Section>

      {/* Platforms */}
      <Section title="Recommended platforms" icon={TrendingUp}>
        <div className="grid grid-cols-1 gap-2">
          {data.platformRecommendations.map((pl) => (
            <a
              key={pl.name}
              href={pl.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 rounded-xl ring-1 ring-border bg-background/50 hover:ring-brand/40 hover:bg-brand/5 transition"
            >
              <div className="size-9 rounded-lg bg-brand/10 text-brand font-bold text-xs grid place-items-center shrink-0">
                {pl.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">{pl.name}</span>
                  <span className="text-[10px] font-bold text-brand">{pl.matchPercent}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{pl.why}</p>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-brand shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </Section>

      {/* Nearby */}
      <Section title="Nearby opportunities" icon={MapPin}>
        <div className="rounded-xl overflow-hidden ring-1 ring-border mb-3 min-h-[120px] relative bg-gradient-to-br from-ink/90 to-brand/20">
          <div className="absolute inset-0 dark-map-grid opacity-60" />
          {data.nearbyEvents.map((ev, i) => (
            <span
              key={ev.id}
              className="absolute size-3 rounded-full bg-brand border-2 border-white map-marker-live"
              style={{ left: `${18 + i * 20}%`, top: `${35 + (i % 2) * 22}%` }}
              title={ev.title}
            />
          ))}
          <p className="absolute bottom-2 left-3 text-[10px] text-white/80">Live map · {data.nearbyEvents.length} events near you</p>
        </div>
        <ul className="space-y-2">
          {data.nearbyEvents.map((ev) => (
            <li key={ev.id} className="p-3 rounded-xl ring-1 ring-border bg-background/40 flex justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{ev.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {ev.venue} · {ev.date} · {ev.distanceKm} km
                </p>
              </div>
              <span className="text-[10px] font-bold text-brand shrink-0">{ev.matchPercent}%</span>
            </li>
          ))}
        </ul>
        <Link to="/nearby" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-brand hover:underline">
          Open full nearby map <ArrowUpRight className="size-3" />
        </Link>
      </Section>

      {/* Timeline */}
      <Section title="AI career timeline" icon={Calendar}>
        <div className="relative pl-4 border-l-2 border-brand/30 space-y-4">
          {data.timeline.map((t) => (
            <div key={t.label} className="relative">
              <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-brand ring-4 ring-background" />
              <p className="text-xs font-bold text-brand">{t.label}</p>
              <p className="text-sm font-semibold">Target ₹{t.earningTarget.toLocaleString("en-IN")}</p>
              <ul className="mt-1 space-y-0.5">
                {t.milestones.map((m) => (
                  <li key={m} className="text-[11px] text-muted-foreground">
                    → {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {expanded ? (
        <div className="glass-panel rounded-xl p-4 text-xs border border-brand/20">
          <p className="font-semibold text-brand mb-1">How to earn: {expanded.title}</p>
          <p className="text-muted-foreground">{expanded.howToEarn}</p>
          <p className="mt-2">
            Success chance ~{expanded.successChance}% · {expanded.daysToAchieve} days to first win
          </p>
        </div>
      ) : null}

      <Link
        to="/opportunities"
        className="block text-center glass-panel rounded-xl py-3 text-sm font-semibold text-brand hover:ring-brand/30 ring-1 ring-border"
      >
        Explore all opportunities →
      </Link>
    </aside>
  );
}

function OpportunityCard({
  opp,
  expanded,
  onToggle,
  onSprint,
}: {
  opp: MatchedOpportunity;
  expanded: boolean;
  onToggle: () => void;
  onSprint: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl ring-1 p-3.5 transition-all",
        expanded ? "ring-brand/50 bg-brand/5 shadow-[0_0_24px_-8px] shadow-brand/40" : "ring-border bg-background/60 hover:ring-brand/25",
      )}
    >
      <div className="flex justify-between gap-2 items-start">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wide text-brand">{TYPE_LABEL[opp.type] ?? opp.type}</span>
            <span className="text-[10px] text-muted-foreground">{opp.platform}</span>
            <DifficultyBadge d={opp.difficulty} />
          </div>
          <h4 className="font-semibold text-sm mt-1.5 leading-snug">{opp.title}</h4>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{opp.description}</p>
        </div>
        <MatchRing percent={opp.matchPercent} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span>₹{opp.minEarning.toLocaleString("en-IN")}–{opp.maxEarning.toLocaleString("en-IN")}/mo</span>
        <span>~{opp.daysToAchieve}d to start</span>
        <span>{opp.successChance}% success est.</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={opp.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1.5 text-[11px] font-semibold hover:opacity-90"
        >
          Apply <ExternalLink className="size-3" />
        </a>
        <button type="button" onClick={onToggle} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg ring-1 ring-border">
          {expanded ? "Less" : "How to earn"}
        </button>
        {opp.id.startsWith("gig-") ? (
          <button type="button" onClick={onSprint} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-brand/15 text-brand">
            7-day sprint
          </button>
        ) : null}
      </div>

      {expanded ? (
        <p className="mt-3 text-[11px] text-foreground/90 border-t border-border pt-3 leading-relaxed">{opp.howToEarn}</p>
      ) : null}
    </div>
  );
}

function MatchRing({ percent }: { percent: number }) {
  return (
    <div className="relative size-12 shrink-0">
      <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className="stroke-brand"
          strokeWidth="3"
          strokeDasharray={`${percent} 100`}
          pathLength={100}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-brand">{percent}%</span>
    </div>
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

function Section({
  title,
  icon: Icon,
  children,
  badge,
  glow,
}: {
  title: string;
  icon: typeof Sparkles;
  children: React.ReactNode;
  badge?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("glass-panel rounded-2xl p-4", glow && "ring-1 ring-brand/20")}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
        <Icon className="size-3.5 text-brand" />
        {title}
        {badge ? <span className="ml-auto text-[10px] font-bold text-brand normal-case">{badge}</span> : null}
      </h3>
      {children}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/70 ring-1 ring-border px-2.5 py-2">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xs font-bold mt-0.5 truncate">{value}</p>
    </div>
  );
}

function SuggestionBlock({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "focus" | "avoid";
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
        {variant === "avoid" ? <Ban className="size-3" /> : <Sparkles className="size-3 text-brand" />}
        {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-[11px] text-foreground/90 pl-2 border-l-2 border-brand/30">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Highlight({ label, text, icon: Icon = TrendingUp }: { label: string; text: string; icon?: typeof TrendingUp }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5 ring-1 ring-border">
      <p className="text-[10px] font-semibold text-brand flex items-center gap-1">
        <Icon className="size-3" /> {label}
      </p>
      <p className="text-[11px] mt-1">{text}</p>
    </div>
  );
}
