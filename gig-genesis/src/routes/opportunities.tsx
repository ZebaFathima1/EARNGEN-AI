import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Card } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAppState } from "@/lib/store";
import { suggestGigs, gigApplyLinks, type Gig } from "@/lib/ai";
import { useDisplayUser } from "@/lib/useDisplayUser";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "AI Opportunities — EARNGEN-AI" },
      { name: "description", content: "Personalized income opportunities ranked by earning potential, ease, and your skills. Apply on Fiverr & Unstop in one click." },
    ],
  }),
  component: Opportunities,
});

const FILTERS = ["All", "Freelance", "Local", "Content", "Teaching"] as const;

function Opportunities() {
  const { state, setSprint } = useAppState();
  const me = useDisplayUser();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const navigate = useNavigate();

  const gigs = useMemo(() => suggestGigs(state.skills, me.city, me.name), [state.skills, me.city, me.name]);
  const visible = filter === "All" ? gigs : gigs.filter((g) => g.category === filter);

  function startGig(g: Gig) {
    setSprint({ gigTitle: g.title, startedAt: new Date().toISOString(), completedDays: [] });
    navigate({ to: "/sprint" });
  }

  return (
    <Shell>
      <RequireAuth>
      <header className="mb-8 fade-up">
        <p className="text-sm text-brand font-semibold uppercase tracking-wider">AI Output</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Income opportunities for your stack</h1>
        <p className="text-muted-foreground mt-2">
          Based on: {state.skills.map((s) => <span key={s} className="inline-block bg-brand/10 text-brand text-xs font-medium rounded px-2 py-0.5 mr-1">{s}</span>)}
        </p>
      </header>

      {gigs.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-semibold">Add at least one skill first</p>
          <p className="text-sm text-muted-foreground mt-2">
            Go to <strong className="text-foreground">Speak with AI</strong>, describe your skill or idea, and gig matches will appear here automatically.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={"text-sm font-medium rounded-lg px-3 py-1.5 ring-1 transition-colors " + (filter === f ? "bg-foreground text-background ring-foreground" : "bg-card text-muted-foreground ring-border hover:text-foreground")}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {visible.map((g, i) => {
              const links = gigApplyLinks(g.title, me.city);
              return (
              <Card key={g.id} className="p-5 fade-up hover:ring-brand/30 transition-shadow" >
                <div style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-12 rounded-xl bg-brand/10 grid place-items-center text-2xl">{g.emoji}</div>
                    <span className={"text-[10px] font-semibold px-2 py-1 rounded uppercase " + (g.difficulty === "Easy" ? "bg-brand/10 text-brand" : g.difficulty === "Medium" ? "bg-chart-3/10 text-chart-3" : "bg-destructive/10 text-destructive")}>{g.difficulty}</span>
                  </div>
                  <h3 className="font-semibold text-base">{g.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 text-pretty">{g.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground">
                    <span>📍 {g.platforms.join(" · ")}</span>
                    <span>⏱ ~{g.daysToFirstEarn}d to first ₹</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a href={links.fiverr} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold rounded-md ring-1 ring-border px-2.5 py-1 hover:bg-muted">Apply on Fiverr ↗</a>
                    <a href={links.unstop} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold rounded-md ring-1 ring-border px-2.5 py-1 hover:bg-muted">Find on Unstop ↗</a>
                    <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold rounded-md ring-1 ring-border px-2.5 py-1 hover:bg-muted">Learn on YouTube ↗</a>
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                    <span className="text-base font-semibold">₹{g.minPrice.toLocaleString("en-IN")} – ₹{g.maxPrice.toLocaleString("en-IN")}</span>
                    <button onClick={() => startGig(g)} className="bg-brand text-brand-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105">
                      Start AI Sprint →
                    </button>
                  </div>
                </div>
              </Card>
            );})}
          </div>
        </>
      )}
      </RequireAuth>
    </Shell>
  );
}
