import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { safePostAuthPath } from "@/lib/safePostAuthPath";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  validateSearch: (raw: unknown) => {
    const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const next = o.next;
    if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && next !== "/auth") {
      return { next };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: "Login or Sign up — EARNGEN-AI" },
      { name: "description", content: "Sign in to track your verified earnings or create a free EARNGEN-AI account." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Too long"),
  name: z.string().trim().min(1, "Name required").max(80),
  college: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
});

function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ email: "", password: "", name: "", college: "", city: "" });
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const destination = safePostAuthPath(next);

  useEffect(() => {
    if (user) navigate({ to: destination });
  }, [user, navigate, destination]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const parsed = signInSchema.safeParse(form);
        if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
        const { error } = await signIn(parsed.data.email, parsed.data.password);
        if (error) setErr(error);
        else navigate({ to: destination });
      } else {
        const parsed = signUpSchema.safeParse(form);
        if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
        const { error } = await signUp(parsed.data.email, parsed.data.password, {
          name: parsed.data.name, college: parsed.data.college, city: parsed.data.city,
        });
        if (error) setErr(error);
        else { setMsg("Account created! Redirecting…"); navigate({ to: destination }); }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-semibold text-2xl tracking-tight text-brand inline-flex items-center gap-2">
            <img src="/logo.png" alt="EARNGEN-AI logo" width={36} height={36} className="size-9" />
            EARNGEN-AI<span className="text-foreground">.</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">Your skills deserve a salary.</p>
        </div>

        <div className="rounded-2xl bg-card ring-1 ring-border p-6">
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg mb-6">
            <button type="button" onClick={() => { setMode("signin"); setErr(null); setMsg(null); }}
              className={"py-2 text-sm font-medium rounded-md transition " + (mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground")}>
              Sign in
            </button>
            <button type="button" onClick={() => { setMode("signup"); setErr(null); setMsg(null); }}
              className={"py-2 text-sm font-medium rounded-md transition " + (mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground")}>
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Priya Sharma" />
                <Field label="College" value={form.college} onChange={(v) => setForm({ ...form, college: v })} placeholder="IIIT Hyderabad" />
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Hyderabad" />
              </>
            )}
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@email.com" />
            <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" />

            {err && <p className="text-sm text-red-500">{err}</p>}
            {msg && <p className="text-sm text-emerald-600">{msg}</p>}

            <button type="submit" disabled={busy}
              className="w-full mt-2 rounded-lg bg-foreground text-background py-2.5 text-sm font-semibold disabled:opacity-50">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground">← Back to landing</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-lg ring-1 ring-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
    </label>
  );
}
