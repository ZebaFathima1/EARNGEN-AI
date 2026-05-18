import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateHackathonPlan, type HackathonPlan } from "@/lib/hackathon-plan.functions";
import type { LiveEvent } from "@/lib/events/types";
import { GlassCard } from "@/components/platform/GlassCard";
import { Sparkles, X } from "lucide-react";

type Props = {
  event: LiveEvent;
  skills: string[];
  interests: string[];
  level: string;
  onClose: () => void;
};

export function HackathonAssistant({ event, skills, interests, level, onClose }: Props) {
  const run = useServerFn(generateHackathonPlan);
  const [plan, setPlan] = useState<HackathonPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const out = await run({
        data: {
          eventTitle: event.title,
          description: event.description,
          skills,
          interests,
          level,
          prizePool: event.prizePool,
        },
      });
      setPlan(out.plan);
      if (out.error) setErr(out.error);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard glow className="p-5 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start gap-2 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase text-brand tracking-widest">Hackathon assistant</p>
          <h3 className="font-semibold text-lg leading-snug">{event.title}</h3>
        </div>
        <button type="button" onClick={onClose} className="size-8 rounded-lg ring-1 ring-border grid place-items-center">
          <X className="size-4" />
        </button>
      </div>

      {!plan ? (
        <button
          type="button"
          disabled={busy}
          onClick={generate}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-light text-white py-3 text-sm font-semibold disabled:opacity-50"
        >
          <Sparkles className={cnIcon(busy)} /> {busy ? "Generating plan…" : "Generate hackathon plan"}
        </button>
      ) : (
        <div className="space-y-4 text-sm">
          <Section title="Project ideas" items={plan.projectIdeas} />
          <p>
            <span className="font-semibold text-brand">Tech stack:</span> {plan.techStack.join(" · ")}
          </p>
          <Section title="PPT outline" items={plan.pptOutline} />
          <div>
            <p className="font-semibold text-brand mb-2">MVP roadmap</p>
            {plan.mvpRoadmap.map((p) => (
              <div key={p.phase} className="mb-2 pl-2 border-l-2 border-brand/30">
                <p className="font-medium text-xs">{p.phase}</p>
                <ul className="text-xs text-muted-foreground">
                  {p.tasks.map((t) => (
                    <li key={t}>→ {t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Section title="Team roles" items={plan.teamRoles} />
          <Section title="Timeline" items={plan.timeline.map((t) => `${t.week}: ${t.focus}`)} />
          <p className="text-xs bg-muted/50 rounded-xl p-3 ring-1 ring-border">
            <span className="font-semibold">Winning strategy:</span> {plan.winningStrategy}
          </p>
          <button type="button" onClick={generate} disabled={busy} className="text-xs font-semibold text-brand hover:underline">
            Regenerate plan
          </button>
        </div>
      )}
      {err ? <p className="text-xs text-destructive mt-2">{err}</p> : null}
    </GlassCard>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-brand mb-1">{title}</p>
      <ul className="text-xs text-muted-foreground space-y-0.5">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}

function cnIcon(busy: boolean) {
  return busy ? "size-4 animate-spin" : "size-4";
}
