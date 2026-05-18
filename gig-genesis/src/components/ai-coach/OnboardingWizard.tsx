import { useState } from "react";
import { AiOrb } from "./AiOrb";
import {
  GOAL_OPTIONS,
  INTEREST_OPTIONS,
  LEVEL_OPTIONS,
  PRIORITY_OPTIONS,
  type StudentProfile,
} from "@/lib/ai-coach/types";
import { defaultProfile } from "@/lib/ai-coach/store";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const STEPS = ["Interests", "Skills", "Goals", "Your rhythm"] as const;

type Props = {
  onComplete: (profile: StudentProfile) => void;
};

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-sm font-medium rounded-xl px-3.5 py-2 ring-1 transition-all",
        selected
          ? "bg-brand text-brand-foreground ring-brand shadow-[0_0_20px_-4px] shadow-brand/40"
          : "bg-card/80 text-muted-foreground ring-border hover:ring-brand/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<StudentProfile>({ ...defaultProfile });

  function toggle(list: string[], item: string) {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete(p);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-[calc(100dvh-4rem)] ai-mesh-bg flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-10 relative overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="ai-particle absolute size-1 rounded-full bg-brand/40"
          style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.7}s` }}
        />
      ))}

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8 fade-up">
          <AiOrb size="lg" className="mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">AI career strategist</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2 ai-shimmer-text">
            Let's build your income DNA
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
            Answer a few questions — I'll generate a personalized roadmap, gigs, and mentor chat tuned to you.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl fade-up">
          <div className="flex items-center justify-between mb-6 gap-4">
            <span className="text-xs font-semibold text-muted-foreground">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </span>
            <span className="text-xs font-semibold text-brand">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-8">
            <div className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <p className="font-medium">What are you interested in?</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} selected={p.interests.includes(opt)} onClick={() => setP({ ...p, interests: toggle(p.interests, opt) })} />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="font-medium">What skills do you already have?</p>
              <textarea
                value={p.skills}
                onChange={(e) => setP({ ...p, skills: e.target.value })}
                rows={4}
                placeholder="e.g. Canva, Python, video editing, content writing…"
                className="w-full rounded-xl bg-background/80 ring-1 ring-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand outline-none"
              />
              <p className="text-xs text-muted-foreground">What tools/software do you know?</p>
              <input
                value={p.tools}
                onChange={(e) => setP({ ...p, tools: e.target.value })}
                placeholder="Figma, VS Code, Premiere Pro…"
                className="w-full rounded-xl bg-background/80 ring-1 ring-border px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand outline-none"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="font-medium">What do you want to achieve?</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} selected={p.goals.includes(opt)} onClick={() => setP({ ...p, goals: toggle(p.goals, opt) })} />
                ))}
              </div>
              <p className="font-medium pt-2">Experience level</p>
              <div className="flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} selected={p.level === opt} onClick={() => setP({ ...p, level: opt })} />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium">Hours per day you can work</span>
                <input type="range" min={1} max={8} value={p.hoursPerDay} onChange={(e) => setP({ ...p, hoursPerDay: Number(e.target.value) })} className="w-full mt-2 accent-brand" />
                <span className="text-xs text-brand font-semibold">{p.hoursPerDay} hours/day</span>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Monthly income target (₹)</span>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={p.incomeTarget}
                  onChange={(e) => setP({ ...p, incomeTarget: Number(e.target.value) || 5000 })}
                  className="mt-2 w-full rounded-xl bg-background/80 ring-1 ring-border px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Preferred language</span>
                <input
                  value={p.language}
                  onChange={(e) => setP({ ...p, language: e.target.value })}
                  className="mt-2 w-full rounded-xl bg-background/80 ring-1 ring-border px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">What type of work do you enjoy most?</span>
                <input
                  value={p.workStyle}
                  onChange={(e) => setP({ ...p, workStyle: e.target.value })}
                  placeholder="Creative, analytical, client-facing…"
                  className="mt-2 w-full rounded-xl bg-background/80 ring-1 ring-border px-4 py-2.5 text-sm"
                />
              </label>
              <p className="text-sm font-medium">What matters most right now?</p>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} selected={p.priorities.includes(opt)} onClick={() => setP({ ...p, priorities: toggle(p.priorities, opt) })} />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground disabled:opacity-40 hover:text-foreground"
            >
              <ChevronLeft className="size-4" /> Back
            </button>
            <button
              type="button"
              onClick={next}
              disabled={step === 0 && p.interests.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 shadow-lg"
            >
              {step === STEPS.length - 1 ? (
                <>
                  <Sparkles className="size-4" /> Generate my plan
                </>
              ) : (
                <>
                  Continue <ChevronRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
