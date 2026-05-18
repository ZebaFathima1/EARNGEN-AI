import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { FeatureHero } from "@/components/platform/FeatureHero";
import { GlassCard } from "@/components/platform/GlassCard";
import { usePlatformState } from "@/lib/platform/store";
import {
  ArrowLeftRight,
  MapPin,
  Wallet,
  Shield,
  Gift,
  Sparkles,
  GraduationCap,
} from "lucide-react";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Network Hub — EARNGEN-AI" },
      { name: "description", content: "Skill exchange, nearby talent, payments, NDAs, and rewards marketplace." },
    ],
  }),
  component: NetworkHub,
});

const FEATURES = [
  {
    to: "/learn",
    icon: GraduationCap,
    title: "AI Learning",
    desc: "Courses, YouTube paths, mentor & learn→earn links",
    tag: "Coursera × Duolingo",
  },
  {
    to: "/exchange",
    icon: ArrowLeftRight,
    title: "Skill Exchange",
    desc: "Swap skills, earn XP, badges & climb the leaderboard",
    tag: "LAB42-style rewards",
  },
  {
    to: "/nearby",
    icon: MapPin,
    title: "Live Events & Hackathons",
    desc: "Devfolio + Unstop feeds, AI match %, hackathon mentor",
    tag: "Real-time",
  },
  {
    to: "/wallet",
    icon: Wallet,
    title: "Instant Wallet",
    desc: "Send, receive, escrow milestones & track earnings",
    tag: "Fintech",
  },
  {
    to: "/nda",
    icon: Shield,
    title: "Trust & NDA",
    desc: "Digital agreements, e-sign flow & trust score",
    tag: "Secure vault",
  },
  {
    to: "/rewards",
    icon: Gift,
    title: "Rewards Store",
    desc: "Redeem points for courses, coupons & partner brands",
    tag: "Marketplace",
  },
] as const;

function NetworkHub() {
  const { state } = usePlatformState();
  const g = state.gamification;

  return (
    <Shell>
      <RequireAuth>
        <FeatureHero
          badge="Next-gen skill economy"
          title="Network Hub"
          subtitle="LinkedIn-grade profiles, Uber-style nearby discovery, Snapchat live presence, LAB42 rewards, and Fiverr-grade payments — all in one AI-powered platform."
        >
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="glass-panel rounded-lg px-3 py-1.5 font-medium">
              <Sparkles className="inline size-3.5 mr-1 text-brand" />
              {g.xp} XP · Lvl {g.level}
            </span>
            <span className="glass-panel rounded-lg px-3 py-1.5 font-medium">🔥 {g.streakDays} day streak</span>
            <span className="glass-panel rounded-lg px-3 py-1.5 font-medium">{state.rewardPoints} reward pts</span>
          </div>
        </FeatureHero>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} className="group block fade-up">
              <GlassCard glow className="p-5 h-full transition-transform group-hover:scale-[1.02]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{f.tag}</span>
                <f.icon className="size-8 text-brand mt-3 mb-2" />
                <h2 className="font-semibold text-lg">{f.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                <span className="inline-block mt-4 text-xs font-semibold text-brand group-hover:underline">
                  Open →
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </RequireAuth>
    </Shell>
  );
}
