import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { speakWithAi } from "@/lib/chat.functions";
import { useAiCoachState } from "@/lib/ai-coach/store";
import { buildRecommendations } from "@/lib/ai-coach/recommendations";
import { useDisplayUser } from "@/lib/useDisplayUser";
import { OnboardingWizard } from "./OnboardingWizard";
import { ChatPanel } from "./ChatPanel";
import { RecommendationDashboard } from "./RecommendationDashboard";
import { AiOrb } from "./AiOrb";
import { PanelRightClose, PanelRightOpen, RotateCcw } from "lucide-react";

export function AiCoachExperience() {
  const runChat = useServerFn(speakWithAi);
  const me = useDisplayUser();
  const { state, completeOnboarding, setMessages, resetOnboarding } = useAiCoachState();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const recommendations = useMemo(
    () => (state.onboardingComplete ? buildRecommendations(state.profile, me.city || "India", me.name || "Student") : null),
    [state.onboardingComplete, state.profile, me.city, me.name],
  );

  async function sendMessage(text: string, opts?: { replaceLast?: boolean }) {
    if (busy) return;
    setErr(null);
    setBusy(true);

    let nextMessages = [...state.messages];
    if (!opts?.replaceLast) {
      nextMessages.push({
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      });
      setMessages(nextMessages);
    }

    const history = nextMessages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

    try {
      const out = await runChat({
        data: {
          message: text,
          profile: state.profile,
          opportunitySummary: recommendations?.opportunitySummaryForChat,
          history: history.length ? history : undefined,
        },
      });
      if (out.error) {
        setErr(out.error);
      } else if (opts?.replaceLast) {
        const updated = [...nextMessages];
        const lastIdx = updated.map((m) => m.role).lastIndexOf("assistant");
        if (lastIdx >= 0) updated[lastIdx] = { ...updated[lastIdx], content: out.reply };
        else
          updated.push({
            id: crypto.randomUUID(),
            role: "assistant",
            content: out.reply,
            createdAt: new Date().toISOString(),
          });
        setMessages(updated);
      } else {
        setMessages([
          ...nextMessages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: out.reply,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  function regenerate() {
    const lastUser = [...state.messages].reverse().find((m) => m.role === "user");
    if (lastUser) sendMessage(lastUser.content, { replaceLast: true });
  }

  if (!state.onboardingComplete) {
    return <OnboardingWizard onComplete={completeOnboarding} />;
  }

  return (
    <div className="ai-mesh-bg min-h-[calc(100dvh-4rem)] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="ai-particle absolute size-1.5 rounded-full bg-brand/30"
            style={{ left: `${8 + i * 11}%`, top: `${15 + (i % 4) * 18}%`, animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-4 fade-up">
          <div className="flex items-center gap-3">
            <AiOrb size="md" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">AI career command center</p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Speak with AI</h1>
              <p className="text-sm text-muted-foreground">Mentor · strategist · opportunity finder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              className="hidden lg:inline-flex items-center gap-2 text-xs font-semibold rounded-xl ring-1 ring-border px-3 py-2 hover:bg-muted"
            >
              {panelOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
              {panelOpen ? "Hide insights" : "Show insights"}
            </button>
            <button
              type="button"
              onClick={resetOnboarding}
              className="inline-flex items-center gap-2 text-xs font-semibold rounded-xl ring-1 ring-border px-3 py-2 hover:bg-muted text-muted-foreground"
            >
              <RotateCcw className="size-4" /> Retake onboarding
            </button>
          </div>
        </header>

        {err ? (
          <p className="mb-4 text-sm text-destructive glass-panel rounded-xl px-4 py-2">{err}</p>
        ) : null}

        <div
          className={
            "grid gap-4 lg:gap-6 " + (panelOpen ? "lg:grid-cols-[1fr_minmax(280px,380px)]" : "lg:grid-cols-1 max-w-4xl mx-auto")
          }
        >
          <ChatPanel
            messages={state.messages}
            profile={state.profile}
            busy={busy}
            opportunityChips={recommendations?.opportunityMatches.slice(0, 3).map((o) => `Explain: ${o.title}`)}
            onSend={(t) => sendMessage(t)}
            onRegenerate={regenerate}
          />
          {recommendations && panelOpen ? (
            <RecommendationDashboard data={recommendations} onToggle={() => setPanelOpen(true)} />
          ) : null}
        </div>

        {!panelOpen && recommendations ? (
          <RecommendationDashboard data={recommendations} collapsed onToggle={() => setPanelOpen(true)} />
        ) : null}
      </div>
    </div>
  );
}
