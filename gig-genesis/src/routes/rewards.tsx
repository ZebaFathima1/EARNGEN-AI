import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Stat } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { FeatureHero } from "@/components/platform/FeatureHero";
import { GlassCard } from "@/components/platform/GlassCard";
import { usePlatformState } from "@/lib/platform/store";
import { MARKETPLACE_REWARDS } from "@/lib/platform/mock-data";
import { POINTS } from "@/lib/platform/points-rules";
import { useSyncWorkRewards } from "@/lib/platform/useSyncWorkRewards";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDollarSign, ListChecks, Zap } from "lucide-react";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Rewards Store — EARNGEN-AI" }] }),
  component: RewardsPage,
});

const EARN_WAYS = [
  { icon: ListChecks, label: "Complete a sprint day", pts: `+${POINTS.sprintDay.points} pts` },
  { icon: Zap, label: "Finish full 7-day sprint", pts: `+${POINTS.sprintComplete.points} pts` },
  { icon: CircleDollarSign, label: "Log income in ledger", pts: `+${POINTS.incomePer100.min}–${POINTS.incomePer100.max} pts` },
  { icon: CheckCircle2, label: "Complete skill exchange", pts: `+${POINTS.exchangeComplete.points} pts` },
  { icon: CheckCircle2, label: "Sign an NDA", pts: `+${POINTS.ndaSigned.points} pts` },
];

function RewardsPage() {
  useSyncWorkRewards();
  const { state, redeemReward } = usePlatformState();

  return (
    <Shell>
      <RequireAuth>
        <FeatureHero
          badge="LAB42 marketplace"
          title="Rewards Store"
          subtitle="Points come only from work you complete — sprints, logged income, exchanges, and NDAs. No free points."
        />

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Stat label="Reward points" value={String(state.rewardPoints)} accent />
          <Stat label="Redemptions" value={String(state.redemptions.length)} />
          <Stat label="Work events logged" value={String(state.pointsLedger.length)} />
        </section>

        <GlassCard className="p-6 mb-8">
          <h2 className="font-semibold mb-3">How to earn points</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EARN_WAYS.map((w) => (
              <li key={w.label} className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-border bg-muted/30">
                <w.icon className="size-4 text-brand shrink-0" />
                <div>
                  <p className="text-sm font-medium">{w.label}</p>
                  <p className="text-xs text-brand font-semibold">{w.pts}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Start a sprint from{" "}
            <Link to="/opportunities" className="text-brand font-semibold hover:underline">
              Opportunities
            </Link>
            , check off each day, then log payment in{" "}
            <Link to="/income" className="text-brand font-semibold hover:underline">
              Income
            </Link>
            .
          </p>
        </GlassCard>

        {state.rewardPoints === 0 ? (
          <GlassCard className="p-8 mb-8 text-center">
            <p className="font-semibold">You have 0 points — complete work to earn rewards</p>
            <p className="text-sm text-muted-foreground mt-2">Redeem buttons unlock once you have enough points from verified actions above.</p>
          </GlassCard>
        ) : null}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MARKETPLACE_REWARDS.map((r) => {
            const canAfford = state.rewardPoints >= r.pointsCost;
            return (
              <GlassCard key={r.id} glow={r.limited} className="p-5 flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="text-4xl">{r.imageEmoji}</span>
                  {r.limited ? (
                    <span className="text-[10px] font-bold uppercase text-chart-4 bg-chart-4/10 px-2 py-0.5 rounded">
                      Limited
                    </span>
                  ) : null}
                </div>
                <h3 className="font-semibold mt-3">{r.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex-1">{r.description}</p>
                <p className="text-[10px] text-brand font-semibold mt-2">{r.partnerBrand}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{r.pointsCost} pts</span>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => redeemReward(r.id, r.title, r.pointsCost)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold",
                      canAfford ? "bg-foreground text-background" : "bg-muted text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    {canAfford ? "Redeem" : "Need more points"}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {state.pointsLedger.length > 0 ? (
          <GlassCard className="mt-8 p-6">
            <h2 className="font-semibold mb-4">Points earned from work</h2>
            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {state.pointsLedger.map((e) => (
                <li key={e.id} className="flex justify-between py-2 border-b border-border last:border-0 gap-4">
                  <div>
                    <span className="font-medium">{e.title}</span>
                    {e.detail ? <p className="text-xs text-muted-foreground">{e.detail}</p> : null}
                  </div>
                  <span className="text-brand font-semibold shrink-0">+{e.points} pts</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        ) : null}

        {state.redemptions.length > 0 ? (
          <GlassCard className="mt-6 p-6">
            <h2 className="font-semibold mb-4">Redemption history</h2>
            <ul className="space-y-2 text-sm">
              {state.redemptions.map((r) => (
                <li key={r.id} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span>{r.title}</span>
                  <span className="text-muted-foreground">−{r.pointsSpent} pts</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        ) : null}
      </RequireAuth>
    </Shell>
  );
}
