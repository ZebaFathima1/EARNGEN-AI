import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { Shell, Card, Stat } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAppState, totalEarned } from "@/lib/store";
import { useDisplayUser } from "@/lib/useDisplayUser";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EARNGEN-AI" },
      { name: "description", content: "Your earnings, active gigs, streak, and proof-of-work in one ERP-style command center." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useAppState();
  const me = useDisplayUser();
  const displayName = me.name;
  const total = totalEarned(state.income);
  const streak = state.sprint?.completedDays.length ?? 0;
  const sprint = state.sprint;

  // Build daily earning series for last 30 days
  const days: { d: string; v: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const v = state.income.filter((e) => e.date.slice(0, 10) === key).reduce((s, e) => s + e.amount, 0);
    days.push({ d: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), v });
  }

  const bySkill: Record<string, number> = {};
  state.income.forEach((e) => { bySkill[e.skill] = (bySkill[e.skill] ?? 0) + e.amount; });
  const skillData = Object.entries(bySkill).map(([name, value]) => ({ name, value }));

  const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

  return (
    <Shell>
      <RequireAuth>
      <header className="mb-6 sm:mb-8 fade-up">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">{displayName} 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base text-pretty">
          You've earned <span className="font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span> across {state.income.length} gigs. Streak: 🔥 {streak} days.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <Stat label="Total Earned" value={`₹${total.toLocaleString("en-IN")}`} sub="+12.4% vs last month" />
        <Stat label="Active Sprint" value={sprint ? `Day ${Math.max(...(sprint.completedDays.length ? sprint.completedDays : [0])) + 1}/7` : "—"} sub={sprint?.gigTitle.slice(0, 28) ?? "Start a sprint"} />
        <Stat label="Verified Proofs" value={String(state.income.length)} sub="Recruiter-ready" />
        <Stat label="Streak" value={`🔥 ${streak} days`} accent sub="Keep going" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Card className="lg:col-span-2 p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Earnings — last 30 days</h2>
              <p className="text-xs text-muted-foreground">Daily INR inflow</p>
            </div>
          </div>
          <div className="h-52 sm:h-64 -mx-1">
            <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted/40 rounded" />}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={days} margin={{ left: -8, right: 4, top: 8, bottom: 0 }}>
                  <XAxis dataKey="d" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={((v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Earned"]) as any} />
                  <Line type="monotone" dataKey="v" stroke="var(--color-brand)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">By skill</h2>
          <div className="h-48">
            <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted/40 rounded" />}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={skillData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {skillData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={((v: any) => `₹${Number(v).toLocaleString("en-IN")}`) as any} />
                </PieChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
          <div className="mt-2 space-y-1">
            {skillData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span>{s.name}</span>
                </div>
                <span className="font-medium">₹{s.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="p-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-brand uppercase tracking-wider">Platform</p>
            <h2 className="font-semibold mt-1">Network Hub — new features</h2>
            <p className="text-sm text-muted-foreground mt-1">Exchange skills, find nearby talent, wallet, NDAs & rewards.</p>
          </div>
          <Link to="/network" className="text-sm font-semibold text-brand shrink-0">Open hub →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
          {[
            { to: "/learn", label: "Learn" },
            { to: "/exchange", label: "Exchange" },
            { to: "/nearby", label: "Live events" },
            { to: "/wallet", label: "Wallet" },
            { to: "/nda", label: "Trust" },
            { to: "/rewards", label: "Rewards" },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="rounded-xl ring-1 ring-border py-3 font-medium hover:bg-brand/5 hover:ring-brand/30 transition">
              {l.label}
            </Link>
          ))}
        </div>
      </Card>

      {sprint && (
        <Card className="p-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-brand uppercase tracking-wider">Today's task</p>
              <h2 className="font-semibold mt-1 line-clamp-2">{sprint.gigTitle}</h2>
            </div>
            <Link to="/sprint" className="text-sm font-semibold text-brand shrink-0">Open sprint →</Link>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const done = sprint.completedDays.includes(d);
              return (
                <div key={d} className={"flex-1 h-2 rounded-full " + (done ? "bg-brand" : "bg-muted")} />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {sprint.completedDays.length}/7 days complete · {Math.round((sprint.completedDays.length / 7) * 100)}% to your ₹1,000 goal 🔥
          </p>
        </Card>
      )}

      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent ledger</h2>
          <Link to="/income" className="text-sm font-semibold text-brand">Open ledger →</Link>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[400px] px-4 sm:px-0">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left font-medium py-2 pl-4 sm:pl-0">Date</th>
                <th className="text-left font-medium py-2">Project</th>
                <th className="text-left font-medium py-2 hidden sm:table-cell">Client</th>
                <th className="text-left font-medium py-2 hidden sm:table-cell">Skill</th>
                <th className="text-right font-medium py-2 pr-4 sm:pr-0">Amount</th>
              </tr>
            </thead>
            <tbody>
              {state.income.slice(0, 5).map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-muted-foreground whitespace-nowrap pl-4 sm:pl-0">{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="py-3 font-medium max-w-[140px] truncate">{e.project}</td>
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">{e.client}</td>
                  <td className="py-3 hidden sm:table-cell"><span className="text-xs px-2 py-0.5 rounded bg-brand/10 text-brand font-medium">{e.skill}</span></td>
                  <td className="py-3 text-right font-semibold whitespace-nowrap pr-4 sm:pr-0">₹{e.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </RequireAuth>
    </Shell>
  );
}
