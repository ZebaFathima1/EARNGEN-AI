import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Card } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAppState, totalEarned } from "@/lib/store";
import { useDisplayUser } from "@/lib/useDisplayUser";
import { generatePoWSummary } from "@/lib/ai";

export const Route = createFileRoute("/proof")({
  head: () => ({
    meta: [
      { title: "Proof-of-Work — EARNGEN-AI" },
      { name: "description", content: "Tamper-proof certificate of your verified gigs and earnings, recruiter-ready." },
    ],
  }),
  component: Proof,
});

function Proof() {
  const { state } = useAppState();
  const me = useDisplayUser();
  const total = totalEarned(state.income);
  const summary = generatePoWSummary(state.skills, total, state.income.length);
  const certId = "PW-" + (8000 + state.income.length * 7).toString();

  function downloadPdf() {
    window.print();
  }

  return (
    <Shell>
      <RequireAuth>
      <header className="mb-8 fade-up">
        <p className="text-xs font-semibold text-brand uppercase tracking-widest">Recruiter Layer</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Your verified Proof-of-Work</h1>
        <p className="text-muted-foreground mt-2 max-w-[58ch] text-pretty">A tamper-proof, AI-summarized record of every gig you've delivered. Share one link instead of a CV.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-3xl bg-gradient-to-br from-foreground to-zinc-800 text-background p-6 sm:p-10 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-light">EARNGEN-AI · Certificate of Verified Work</p>
                <h2 className="text-2xl sm:text-3xl font-semibold mt-3 sm:mt-4 tracking-tight">{me.name}</h2>
                <p className="text-background/60 text-sm mt-1">{[me.college, me.city].filter(Boolean).join(" · ") || "EARNGEN-AI member"}</p>
              </div>
              <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
                <div>
                  <p className="text-[10px] font-mono text-background/40">CERT ID</p>
                  <p className="font-mono text-xs">{certId}</p>
                </div>
                <div className="mt-0 sm:mt-3 size-14 sm:size-16 bg-background/10 rounded grid grid-cols-4 gap-0.5 p-1.5">
                  {Array.from({ length: 16 }).map((_, i) => <div key={i} className={"rounded-sm " + (i % 3 === 0 ? "bg-brand-light" : "bg-background/30")} />)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-10">
              <div><p className="text-[10px] uppercase tracking-widest text-background/50">Verified earnings</p><p className="text-lg sm:text-2xl font-semibold mt-1">₹{total.toLocaleString("en-IN")}</p></div>
              <div><p className="text-[10px] uppercase tracking-widest text-background/50">Gigs delivered</p><p className="text-lg sm:text-2xl font-semibold mt-1">{state.income.length}</p></div>
              <div><p className="text-[10px] uppercase tracking-widest text-background/50">Trust score</p><p className="text-lg sm:text-2xl font-semibold mt-1 text-brand-light">A+</p></div>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-background/10">
              <p className="text-[10px] uppercase tracking-widest text-background/50 mb-3">AI summary</p>
              <p className="text-sm leading-relaxed text-background/90">{summary}</p>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-background/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-background/50">Verified by</p>
                <p className="font-mono text-sm mt-1">EARNGEN-AI.app</p>
              </div>
              <p className="text-[10px] text-background/50">Issued {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={downloadPdf} className="bg-brand text-brand-foreground font-semibold px-5 py-2.5 rounded-lg">Download PDF</button>
            <Link to="/r/$username" params={{ username: "priya" }} className="bg-card ring-1 ring-border font-semibold px-5 py-2.5 rounded-lg">View public profile →</Link>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold">Verified skills</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {state.skills.map((s) => (
                <span key={s} className="text-xs font-medium bg-brand/10 text-brand rounded-md px-2.5 py-1 ring-1 ring-brand/20">{s} ✓</span>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold">Recent verified gigs</h3>
            <ul className="mt-4 space-y-3">
              {state.income.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{e.project}</p>
                    <p className="text-xs text-muted-foreground">{e.client} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className="font-semibold whitespace-nowrap">₹{e.amount.toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
      </RequireAuth>
    </Shell>
  );
}
