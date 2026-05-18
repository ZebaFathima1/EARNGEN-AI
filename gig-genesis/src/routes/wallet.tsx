import { createFileRoute } from "@tanstack/react-router";
import { Shell, Stat } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { FeatureHero } from "@/components/platform/FeatureHero";
import { GlassCard } from "@/components/platform/GlassCard";
import { usePlatformState } from "@/lib/platform/store";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Lock, CreditCard } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — EARNGEN-AI" }] }),
  component: WalletPage,
});

const TYPE_ICON = {
  receive: ArrowDownLeft,
  send: ArrowUpRight,
  milestone: Lock,
  escrow_hold: Lock,
  escrow_release: ArrowDownLeft,
  withdraw: CreditCard,
};

function WalletPage() {
  const { state } = usePlatformState();
  const w = state.wallet;

  return (
    <Shell>
      <RequireAuth>
        <FeatureHero
          badge="Instant payments"
          title="Wallet & Earnings"
          subtitle="Send, receive, milestone escrow, and withdrawals. Razorpay / Stripe / UPI integrations ready via server functions."
        />

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Stat label="Available" value={`₹${w.balanceInr.toLocaleString("en-IN")}`} accent sub="Withdraw anytime" />
          <Stat label="In escrow" value={`₹${w.pendingInr.toLocaleString("en-IN")}`} sub="Milestone holds" />
          <Stat label="Reward points" value={String(state.rewardPoints)} sub="Redeem in store" />
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard glow className="lg:col-span-2 p-6">
            <h2 className="font-semibold mb-4">Transaction history</h2>
            <ul className="space-y-3">
              {w.transactions.map((t) => {
                const Icon = TYPE_ICON[t.type] ?? ArrowUpRight;
                const incoming = t.type === "receive" || t.type === "escrow_release";
                return (
                  <li key={t.id} className="flex items-center gap-4 p-4 rounded-xl ring-1 ring-border bg-muted/20">
                    <div className={cn("size-10 rounded-xl grid place-items-center", incoming ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{t.counterparty}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {t.type.replace("_", " ")} · {t.status}
                        {t.note ? ` · ${t.note}` : ""}
                      </p>
                    </div>
                    <p className={cn("font-semibold whitespace-nowrap", incoming ? "text-brand" : "text-foreground")}>
                      {incoming ? "+" : "−"}₹{t.amount.toLocaleString("en-IN")}
                    </p>
                  </li>
                );
              })}
            </ul>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-3">Quick actions</h3>
              <div className="space-y-2">
                <button type="button" className="w-full rounded-lg bg-foreground text-background py-2.5 text-sm font-semibold">
                  Send payment
                </button>
                <button type="button" className="w-full rounded-lg ring-1 ring-border py-2.5 text-sm font-semibold">
                  Request milestone escrow
                </button>
                <button type="button" className="w-full rounded-lg ring-1 ring-border py-2.5 text-sm font-semibold">
                  Withdraw to UPI
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">Integrations: Razorpay · Stripe · UPI (placeholder)</p>
            </GlassCard>
            <GlassCard className="p-4 text-xs text-muted-foreground">
              Payment notifications and webhook handlers can be wired via Supabase Edge Functions + Nitro server routes.
            </GlassCard>
          </div>
        </div>
      </RequireAuth>
    </Shell>
  );
}
