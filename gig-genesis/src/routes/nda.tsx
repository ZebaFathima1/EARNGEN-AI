import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Stat } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { FeatureHero } from "@/components/platform/FeatureHero";
import { GlassCard } from "@/components/platform/GlassCard";
import { usePlatformState } from "@/lib/platform/store";
import { cn } from "@/lib/utils";
import { FileText, Shield, PenLine } from "lucide-react";

export const Route = createFileRoute("/nda")({
  head: () => ({ meta: [{ title: "Trust & NDA — EARNGEN-AI" }] }),
  component: NdaPage,
});

function NdaPage() {
  const { state, createNda, signNda } = usePlatformState();
  const [title, setTitle] = useState("");
  const trustScore = 78 + state.ndas.filter((n) => n.status === "signed").length * 5;

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createNda(title.trim());
    setTitle("");
  }

  return (
    <Shell>
      <RequireAuth>
        <FeatureHero
          badge="Secure vault"
          title="Trustable NDA System"
          subtitle="AI-generated agreement templates, e-sign flow, and project confidentiality — DocuSign-style, built for student collaborations."
        />

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Stat label="Trust score" value={`${trustScore}/100`} accent sub="Verified collaborations" />
          <Stat label="Signed NDAs" value={String(state.ndas.filter((n) => n.status === "signed").length)} />
          <Stat label="Pending" value={String(state.ndas.filter((n) => n.status === "pending_signature").length)} />
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard glow className="lg:col-span-2 p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <FileText className="size-4 text-brand" /> Agreement vault
            </h2>
            <ul className="space-y-3">
              {state.ndas.map((nda) => (
                <li key={nda.id} className="p-4 rounded-xl ring-1 ring-border flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold">{nda.projectTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {nda.counterparty} · {new Date(nda.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {nda.status === "pending_signature" ? (
                      <button
                        type="button"
                        onClick={() => signNda(nda.id)}
                        className="text-xs font-semibold rounded-lg bg-brand text-brand-foreground px-3 py-1.5"
                      >
                        Sign (+60 pts)
                      </button>
                    ) : null}
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase px-2.5 py-1 rounded-md",
                        nda.status === "signed" && "bg-brand/10 text-brand",
                        nda.status === "pending_signature" && "bg-chart-3/15 text-chart-3",
                        nda.status === "draft" && "bg-muted text-muted-foreground",
                      )}
                    >
                      {nda.status.replace("_", " ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <PenLine className="size-4" /> Generate NDA
              </h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project name"
                  className="w-full rounded-lg ring-1 ring-border px-3 py-2 text-sm"
                />
                <button type="submit" className="w-full rounded-lg bg-foreground text-background py-2.5 text-sm font-semibold">
                  Create & send for e-sign
                </button>
              </form>
            </GlassCard>
            <GlassCard className="p-5">
              <Shield className="size-8 text-brand mb-2" />
              <p className="text-sm font-medium">Verified collaboration badge</p>
              <p className="text-xs text-muted-foreground mt-1">
                Signed NDAs boost your public trust score and unlock premium matching.
              </p>
            </GlassCard>
            <GlassCard className="p-4 text-xs text-muted-foreground">
              PDF generation + secure storage: wire to Supabase Storage and server functions. Template text generated via Groq.
            </GlassCard>
          </div>
        </div>
      </RequireAuth>
    </Shell>
  );
}
