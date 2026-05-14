import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState, totalEarned } from "@/lib/store";
import { useDisplayUser } from "@/lib/useDisplayUser";
import { generatePoWSummary } from "@/lib/ai";

export const Route = createFileRoute("/r/$username")({
  head: () => ({
    meta: [
      { title: "Verified Earner — EARNGEN-AI Public Profile" },
      { name: "description", content: "Public proof-of-work profile. Real gigs, real earnings, recruiter-verified." },
      { property: "og:title", content: "Verified Earner — EARNGEN-AI Profile" },
      { property: "og:description", content: "Real gigs, real earnings, real proof. No fluffy CVs." },
    ],
  }),
  component: PublicProfile,
});

function PublicProfile() {
  const { username } = Route.useParams();
  const { state } = useAppState();
  const me = useDisplayUser();
  const total = totalEarned(state.income);
  const summary = generatePoWSummary(state.skills, total, state.income.length);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
            >
              ← Back
            </Link>
            <span className="h-4 w-px bg-border shrink-0" aria-hidden />
            <span className="font-semibold tracking-tight text-brand truncate">
              EARNGEN-AI<span className="text-foreground">.</span>
            </span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">Public Profile · @{username}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="flex items-start justify-between gap-6 fade-up">
          <div className="flex items-center gap-5">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-brand to-brand-light grid place-items-center text-3xl font-semibold text-white">
              {me.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{me.name}</h1>
              <p className="text-muted-foreground mt-1">{[me.college, me.city].filter(Boolean).join(" · ") || "EARNGEN-AI member"}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand/10 ring-1 ring-brand/20 rounded-md px-2.5 py-1">
                  <span className="size-1.5 rounded-full bg-brand pulse-dot" />
                  EARNGEN-AI Verified
                </span>
                <span className="text-xs font-semibold text-foreground bg-muted rounded-md px-2.5 py-1">Trust Score A+</span>
              </div>
            </div>
          </div>
          <button className="hidden md:inline-flex bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm">Contact</button>
        </header>

        <section className="grid grid-cols-3 gap-4 mt-10">
          <div className="p-5 rounded-2xl bg-card ring-1 ring-border"><p className="text-xs text-muted-foreground">Verified earnings</p><p className="text-2xl font-semibold mt-1">₹{total.toLocaleString("en-IN")}</p></div>
          <div className="p-5 rounded-2xl bg-card ring-1 ring-border"><p className="text-xs text-muted-foreground">Gigs delivered</p><p className="text-2xl font-semibold mt-1">{state.income.length}</p></div>
          <div className="p-5 rounded-2xl bg-card ring-1 ring-border"><p className="text-xs text-muted-foreground">Avg per gig</p><p className="text-2xl font-semibold mt-1">₹{Math.round(total / Math.max(1, state.income.length)).toLocaleString("en-IN")}</p></div>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Verified skills</h2>
          <div className="flex flex-wrap gap-2">
            {state.skills.map((s) => (
              <span key={s} className="text-sm font-medium bg-card ring-1 ring-border rounded-lg px-3 py-1.5">{s} <span className="text-brand">✓</span></span>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">AI work summary</h2>
          <div className="p-6 rounded-2xl bg-card ring-1 ring-border">
            <p className="text-base leading-relaxed text-pretty">{summary}</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Verified gig history</h2>
          <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
            <ol className="divide-y divide-border">
              {state.income.map((e) => (
                <li key={e.id} className="p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-brand/10 grid place-items-center text-brand font-semibold text-xs">{e.skill[0]}</div>
                    <div>
                      <p className="font-semibold">{e.project}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{e.client} · {e.platform} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-semibold uppercase text-brand bg-brand/10 rounded px-2 py-0.5">Verified ✓</span>
                        <span className="text-[10px] font-medium text-muted-foreground">Skill: {e.skill}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-semibold whitespace-nowrap">₹{e.amount.toLocaleString("en-IN")}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-3">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Back to landing
          </Link>
          <p className="text-xs text-muted-foreground">Verified earner profile · skillsync.io/r/{username}</p>
        </footer>
      </div>
    </div>
  );
}
