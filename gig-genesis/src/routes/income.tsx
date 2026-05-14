import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Card } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAppState, totalEarned } from "@/lib/store";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

export const Route = createFileRoute("/income")({
  head: () => ({
    meta: [
      { title: "Income Ledger — EARNGEN-AI" },
      { name: "description", content: "ERP-style income tracker for student earners. Log gigs, see growth, mint proof." },
    ],
  }),
  component: Income,
});

function Income() {
  const { state, addIncome, removeIncome } = useAppState();
  const [form, setForm] = useState({ amount: "", project: "", client: "", platform: "WhatsApp", skill: state.skills[0] ?? "Canva" });

  const total = totalEarned(state.income);
  const avg = state.income.length ? Math.round(total / state.income.length) : 0;
  const best = state.income.reduce((m, e) => Math.max(m, e.amount), 0);

  const weekly = useMemo(() => {
    const buckets: Record<string, number> = {};
    state.income.forEach((e) => {
      const d = new Date(e.date);
      const week = `W${getWeek(d)}`;
      buckets[week] = (buckets[week] ?? 0) + e.amount;
    });
    return Object.entries(buckets).slice(-8).map(([name, value]) => ({ name, value }));
  }, [state.income]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseInt(form.amount, 10);
    if (!amt || !form.project || !form.client) return;
    addIncome({ amount: amt, project: form.project, client: form.client, platform: form.platform, skill: form.skill, date: new Date().toISOString() });
    setForm({ amount: "", project: "", client: "", platform: "WhatsApp", skill: state.skills[0] ?? "Canva" });
  }

  return (
    <Shell>
      <RequireAuth>
      <header className="mb-8 fade-up">
        <h1 className="text-3xl font-semibold tracking-tight">Income Ledger</h1>
        <p className="text-muted-foreground mt-2">Every entry becomes a verified Proof-of-Work record.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5"><p className="text-xs text-muted-foreground">Total revenue</p><p className="text-2xl font-semibold mt-1">₹{total.toLocaleString("en-IN")}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Avg per gig</p><p className="text-2xl font-semibold mt-1">₹{avg.toLocaleString("en-IN")}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Best week</p><p className="text-2xl font-semibold mt-1">₹{best.toLocaleString("en-IN")}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Gigs delivered</p><p className="text-2xl font-semibold mt-1">{state.income.length}</p></Card>
      </section>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4">Weekly earnings</h2>
          <div className="h-56">
            <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted/40 rounded" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={((v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Earned"]) as any} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {weekly.map((_, i) => <Cell key={i} fill="var(--color-brand)" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Log new income</h2>
          <form onSubmit={submit} className="mt-4 space-y-3 text-sm">
            <Field label="Amount (₹)"><input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand" /></Field>
            <Field label="Project"><input required value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand" /></Field>
            <Field label="Client"><input required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand" /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Platform"><select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand">{["WhatsApp", "Instagram DM", "Fiverr", "Upwork", "LinkedIn", "Email", "Direct"].map((p) => <option key={p}>{p}</option>)}</select></Field>
              <Field label="Skill"><select value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} className="w-full bg-muted rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand">{state.skills.map((s) => <option key={s}>{s}</option>)}</select></Field>
            </div>
            <button type="submit" className="w-full bg-brand text-brand-foreground font-semibold py-2.5 rounded-lg hover:brightness-105">Log + mint proof →</button>
          </form>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="font-semibold">All entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left font-medium py-3 px-4 sm:px-6">Date</th>
                <th className="text-left font-medium py-3 px-4 sm:px-6">Project</th>
                <th className="text-left font-medium py-3 px-4 sm:px-6">Client</th>
                <th className="text-left font-medium py-3 px-4 sm:px-6">Platform</th>
                <th className="text-left font-medium py-3 px-4 sm:px-6">Skill</th>
                <th className="text-right font-medium py-3 px-4 sm:px-6">Amount</th>
                <th className="text-right font-medium py-3 px-4 sm:px-6">Status</th>
                <th className="py-3 px-4 sm:px-6"></th>
              </tr>
            </thead>
            <tbody>
              {state.income.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-3 px-4 sm:px-6 text-muted-foreground whitespace-nowrap">{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="py-3 px-4 sm:px-6 font-medium max-w-[160px] truncate">{e.project}</td>
                  <td className="py-3 px-4 sm:px-6 text-muted-foreground">{e.client}</td>
                  <td className="py-3 px-4 sm:px-6 text-muted-foreground">{e.platform}</td>
                  <td className="py-3 px-4 sm:px-6"><span className="text-xs px-2 py-0.5 rounded bg-brand/10 text-brand font-medium whitespace-nowrap">{e.skill}</span></td>
                  <td className="py-3 px-4 sm:px-6 text-right font-semibold whitespace-nowrap">₹{e.amount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 sm:px-6 text-right"><span className="text-[10px] font-semibold uppercase text-brand whitespace-nowrap">Verified ✓</span></td>
                  <td className="py-3 px-4 sm:px-6 text-right"><button onClick={() => removeIncome(e.id)} className="text-xs text-muted-foreground hover:text-destructive">Delete</button></td>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function getWeek(d: Date) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
}
