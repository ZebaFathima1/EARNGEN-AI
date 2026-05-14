import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { Shell, Card } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { speakWithAi } from "@/lib/chat.functions";
import { suggestGigs, gigApplyLinks, generateSprintPlan, type Gig } from "@/lib/ai";
import { useAppState } from "@/lib/store";
import { useDisplayUser } from "@/lib/useDisplayUser";

export const Route = createFileRoute("/speak-with-ai")({
  head: () => ({
    meta: [
      { title: "Speak with AI — EARNGEN-AI" },
      { name: "description", content: "Share your idea and get a practical income plan from AI." },
    ],
  }),
  component: SpeakWithAiPage,
});

/** Extract skill-like keywords from free text to feed into gig matching. */
function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  // Split on whitespace and punctuation, keep tokens ≥ 3 chars
  const tokens = lower.split(/[\s,.\-!?;:()]+/).filter((t) => t.length >= 3);
  // Deduplicate
  return Array.from(new Set(tokens));
}

function SpeakWithAiPage() {
  const runChat = useServerFn(speakWithAi);
  const { setSprint } = useAppState();
  const me = useDisplayUser();
  const navigate = useNavigate();

  const [idea, setIdea] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [filter, setFilter] = useState<"All" | "Freelance" | "Local" | "Content" | "Teaching">("All");

  const FILTERS = ["All", "Freelance", "Local", "Content", "Teaching"] as const;

  const gigs = useMemo(() => {
    if (!submittedIdea) return [];
    const keywords = extractKeywords(submittedIdea);
    return suggestGigs(keywords, me.city || "India", me.name || "there");
  }, [submittedIdea, me.city, me.name]);

  const visibleGigs = filter === "All" ? gigs : gigs.filter((g) => g.category === filter);

  const sprintDays = useMemo(
    () => (selectedGig ? generateSprintPlan(selectedGig) : []),
    [selectedGig],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = idea.trim();
    if (!msg || busy) return;
    setBusy(true);
    setErr(null);
    setReply("");
    setSelectedGig(null);
    setSubmittedIdea(msg);
    try {
      const out = await runChat({ data: { message: msg } });
      if (out.error) setErr(out.error);
      else setReply(out.reply);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  function startSprint(g: Gig) {
    setSprint({ gigTitle: g.title, startedAt: new Date().toISOString(), completedDays: [] });
    navigate({ to: "/sprint" });
  }

  const hasResults = reply || busy;

  return (
    <Shell>
      <RequireAuth>
        {/* ── Header ── */}
        <header className="mb-8 max-w-3xl fade-up">
          <p className="text-xs font-semibold text-brand uppercase tracking-widest">AI coach</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">Speak with AI</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Describe your skill, idea, or goal. Get concrete gig opportunities, earning steps, and a 7-day action plan.
          </p>
        </header>

        {/* ── Input + AI Reply ── */}
        <div className="grid lg:grid-cols-5 gap-6 max-w-5xl">
          {/* Form */}
          <Card className="p-5 lg:col-span-2 h-fit">
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Your idea or skill</span>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={10}
                  placeholder="Example: I know Python and want my first paid project this month from college…"
                  className="mt-2 w-full rounded-xl bg-muted/50 ring-1 ring-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand resize-y min-h-[200px]"
                />
              </label>
              {err ? <p className="text-sm text-destructive">{err}</p> : null}
              <button
                type="submit"
                disabled={busy || !idea.trim()}
                className="w-full rounded-lg bg-brand text-brand-foreground py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105"
              >
                {busy ? "Thinking…" : "Get income plan →"}
              </button>
            </form>
          </Card>

          {/* AI Reply */}
          <Card className="p-6 lg:col-span-3 min-h-[320px]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">AI advice</p>
            {!hasResults ? (
              <p className="text-sm text-muted-foreground text-pretty">
                Your personalized income plan will appear here — including gig ideas, pricing in ₹, client platforms, and a 7-day sprint.
              </p>
            ) : busy && !reply ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            ) : (
              <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{reply}</div>
            )}
          </Card>
        </div>

        {/* ── Matching Opportunities (shown after reply) ── */}
        {reply && gigs.length > 0 && (
          <section className="mt-12 max-w-5xl fade-up">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-brand uppercase tracking-widest">Matched for you</p>
                <h2 className="text-2xl font-semibold tracking-tight mt-1">Income opportunities</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Based on your message — pick a gig and launch your 7-day sprint.
            </p>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={
                    "text-sm font-medium rounded-lg px-3 py-1.5 ring-1 transition-colors " +
                    (filter === f
                      ? "bg-foreground text-background ring-foreground"
                      : "bg-card text-muted-foreground ring-border hover:text-foreground")
                  }
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {visibleGigs.map((g, i) => {
                const links = gigApplyLinks(g.title, me.city || "India");
                const isSelected = selectedGig?.id === g.id;
                return (
                  <div key={g.id} style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}><Card
                    className={"p-5 fade-up transition-all cursor-pointer " + (isSelected ? "ring-2 ring-brand" : "hover:ring-brand/30")}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="size-12 rounded-xl bg-brand/10 grid place-items-center text-2xl">{g.emoji}</div>
                      <span
                        className={
                          "text-[10px] font-semibold px-2 py-1 rounded uppercase " +
                          (g.difficulty === "Easy"
                            ? "bg-brand/10 text-brand"
                            : g.difficulty === "Medium"
                              ? "bg-chart-3/10 text-chart-3"
                              : "bg-destructive/10 text-destructive")
                        }
                      >
                        {g.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base">{g.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-pretty">{g.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground">
                      <span>📍 {g.platforms.join(" · ")}</span>
                      <span>⏱ ~{g.daysToFirstEarn}d to first ₹</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <a href={links.fiverr} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold rounded-md ring-1 ring-border px-2.5 py-1 hover:bg-muted">
                        Apply on Fiverr ↗
                      </a>
                      <a href={links.unstop} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold rounded-md ring-1 ring-border px-2.5 py-1 hover:bg-muted">
                        Find on Unstop ↗
                      </a>
                      <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold rounded-md ring-1 ring-border px-2.5 py-1 hover:bg-muted">
                        Learn on YouTube ↗
                      </a>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-border">
                      <span className="text-base font-semibold">
                        ₹{g.minPrice.toLocaleString("en-IN")} – ₹{g.maxPrice.toLocaleString("en-IN")}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedGig(isSelected ? null : g)}
                          className="text-sm font-semibold px-3 py-2 rounded-lg ring-1 ring-border hover:bg-muted"
                        >
                          {isSelected ? "Hide plan" : "See 7-day plan"}
                        </button>
                        <button
                          onClick={() => startSprint(g)}
                          className="bg-brand text-brand-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105"
                        >
                          Start Sprint →
                        </button>
                      </div>
                    </div>

                    {/* Inline 7-day plan */}
                    {isSelected && sprintDays.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-border space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand">7-Day action plan</p>
                        {sprintDays.map((d) => (
                          <div key={d.day} className="flex gap-3">
                            <div className="mt-0.5 size-6 rounded-full bg-brand/10 text-brand text-xs font-bold grid place-items-center shrink-0">
                              {d.day}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{d.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{d.detail}</p>
                              {d.script && (
                                <p className="text-xs italic text-foreground/70 mt-1 bg-muted rounded-lg px-3 py-2">
                                  "{d.script}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => startSprint(g)}
                          className="w-full mt-2 bg-brand text-brand-foreground text-sm font-semibold py-2.5 rounded-lg hover:brightness-105"
                        >
                          Launch full AI Sprint →
                        </button>
                      </div>
                    )}
                  </Card></div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── How to earn section (shown after reply, no gig matches) ── */}
        {reply && gigs.length === 0 && (
          <section className="mt-12 max-w-5xl fade-up">
            <Card className="p-8 text-center">
              <p className="text-2xl mb-3">💡</p>
              <h3 className="font-semibold text-lg">How to start earning</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[50ch] mx-auto text-pretty">
                Browse all available gig opportunities, filter by category, and launch your 7-day income sprint — no experience required.
              </p>
              <a
                href="/opportunities"
                className="inline-flex mt-5 bg-brand text-brand-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:brightness-105"
              >
                Browse all opportunities →
              </a>
            </Card>
          </section>
        )}
      </RequireAuth>
    </Shell>
  );
}
