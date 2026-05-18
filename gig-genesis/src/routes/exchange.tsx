import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Stat } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { FeatureHero } from "@/components/platform/FeatureHero";
import { GlassCard } from "@/components/platform/GlassCard";
import { XpBar } from "@/components/platform/XpBar";
import { usePlatformState, BADGES } from "@/lib/platform/store";
import { LEADERBOARD } from "@/lib/platform/mock-data";
import { getChallengeProgress } from "@/lib/platform/award-work";
import { useSyncWorkRewards } from "@/lib/platform/useSyncWorkRewards";
import { useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Trophy, Flame, Target, Lock } from "lucide-react";

export const Route = createFileRoute("/exchange")({
  head: () => ({ meta: [{ title: "Skill Exchange — EARNGEN-AI" }] }),
  component: ExchangePage,
});

const TIER_GLOW: Record<string, string> = {
  bronze: "badge-glow-bronze",
  silver: "badge-glow-silver",
  gold: "badge-glow-gold",
  platinum: "badge-glow-platinum",
};

function ExchangePage() {
  useSyncWorkRewards();
  const app = useAppState();
  const { state, postExchange, completeExchange } = usePlatformState();
  const g = state.gamification;
  const [offered, setOffered] = useState("");
  const [wanted, setWanted] = useState("");

  const challenges = getChallengeProgress(app.state, state);

  const board = LEADERBOARD.map((e) =>
    e.isYou ? { ...e, xp: g.xp, level: g.level, streak: g.streakDays, skillScore: g.skillScore } : e,
  ).sort((a, b) => b.xp - a.xp);

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!offered.trim() || !wanted.trim()) return;
    postExchange(offered.trim(), wanted.trim());
    setOffered("");
    setWanted("");
  }

  return (
    <Shell>
      <RequireAuth>
        <FeatureHero
          badge="LAB42-inspired"
          title="Skill Exchange & Rewards"
          subtitle="Earn XP and redeem points only from real work — sprints, income logged, completed exchanges, and signed NDAs."
        />

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="XP" value={String(g.xp)} sub={`Level ${g.level}`} accent />
          <Stat label="Reward points" value={String(state.rewardPoints)} sub="Redeem in store" />
          <Stat label="Streak" value={`🔥 ${g.streakDays}`} sub="Days you completed work" />
          <Stat label="Badges" value={String(g.earnedBadgeIds.length)} sub={`of ${BADGES.length}`} />
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard glow className="p-6">
              <h2 className="font-semibold flex items-center gap-2">
                <Target className="size-4 text-brand" /> Post skill exchange
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Posting alone does not grant points. Mark complete after you finish the swap.</p>
              <form onSubmit={handlePost} className="mt-4 grid sm:grid-cols-2 gap-3">
                <input
                  value={offered}
                  onChange={(e) => setOffered(e.target.value)}
                  placeholder="I offer (e.g. React)"
                  className="rounded-lg ring-1 ring-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={wanted}
                  onChange={(e) => setWanted(e.target.value)}
                  placeholder="I want (e.g. UI review)"
                  className="rounded-lg ring-1 ring-border bg-background px-3 py-2 text-sm"
                />
                <button type="submit" className="sm:col-span-2 rounded-lg bg-foreground text-background py-2.5 text-sm font-semibold">
                  Publish exchange
                </button>
              </form>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="font-semibold mb-4">Open exchanges</h2>
              {state.exchanges.length === 0 ? (
                <p className="text-sm text-muted-foreground">No exchanges yet. Post one above.</p>
              ) : (
                <ul className="space-y-3">
                  {state.exchanges.map((ex) => (
                    <li key={ex.id} className="flex justify-between items-center gap-4 p-4 rounded-xl bg-muted/50 ring-1 ring-border">
                      <div>
                        <p className="font-medium">
                          <span className="text-brand">{ex.offeredSkill}</span>
                          <span className="text-muted-foreground mx-2">↔</span>
                          {ex.wantedSkill}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{ex.status}</p>
                      </div>
                      {ex.status === "completed" ? (
                        <span className="text-xs font-semibold text-brand">+80 pts earned</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => completeExchange(ex.id)}
                          className="text-xs font-semibold rounded-lg bg-brand text-brand-foreground px-3 py-1.5"
                        >
                          Mark completed
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Flame className="size-4 text-brand" /> Challenges
              </h2>
              <p className="text-xs text-muted-foreground mb-3">Unlock automatically when you complete the action — no manual claiming.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {challenges.map((ch) => (
                  <div
                    key={ch.id}
                    className={cn(
                      "text-left p-4 rounded-xl ring-1 ring-border",
                      ch.done ? "bg-brand/5 ring-brand/30" : "opacity-90",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{ch.title}</p>
                      {ch.done ? (
                        <span className="text-[10px] font-bold text-brand">✓ +{ch.xpReward} XP</span>
                      ) : (
                        <Lock className="size-3.5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ch.description}</p>
                    {!ch.done ? <p className="text-[10px] text-brand mt-2">{ch.hint}</p> : null}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard glow className="p-6">
              <XpBar xp={g.xp} level={g.level} />
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="font-semibold mb-4">Achievements</h2>
              <p className="text-xs text-muted-foreground mb-3">Earned only from verified work.</p>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((b) => {
                  const earned = g.earnedBadgeIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        "p-3 rounded-xl text-center ring-1 ring-border",
                        earned && TIER_GLOW[b.tier],
                        !earned && "opacity-45 grayscale",
                      )}
                    >
                      <span className="text-2xl">{b.icon}</span>
                      <p className="text-xs font-semibold mt-2">{b.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{b.description}</p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Trophy className="size-4 text-brand" /> Leaderboard
              </h2>
              <ol className="space-y-2">
                {board.map((e, i) => (
                  <li
                    key={e.name}
                    className={cn(
                      "flex justify-between text-sm py-2 px-3 rounded-lg",
                      e.isYou ? "bg-brand/10 ring-1 ring-brand/20 font-semibold" : "bg-muted/30",
                    )}
                  >
                    <span>
                      #{i + 1} {e.name}
                    </span>
                    <span className="text-muted-foreground">{e.xp.toLocaleString()} XP</span>
                  </li>
                ))}
              </ol>
            </GlassCard>
          </div>
        </div>
      </RequireAuth>
    </Shell>
  );
}
