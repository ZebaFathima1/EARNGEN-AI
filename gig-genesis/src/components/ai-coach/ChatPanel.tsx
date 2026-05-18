import { useEffect, useRef, useState } from "react";
import { AiOrb } from "./AiOrb";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage, StudentProfile } from "@/lib/ai-coach/types";
import { cn } from "@/lib/utils";
import { Mic, RefreshCw, Send, Sparkles } from "lucide-react";

const QUICK_PROMPTS = [
  "Which opportunity should I apply to first?",
  "Explain my top 3 matches and how to apply",
  "Fastest way to hit my income goal",
  "What should I avoid wasting time on?",
  "Build a week-by-week execution plan",
  "Compare Fiverr vs Upwork for me",
];

type Props = {
  messages: ChatMessage[];
  profile: StudentProfile;
  busy: boolean;
  opportunityChips?: string[];
  onSend: (text: string) => void;
  onRegenerate: () => void;
};

export function ChatPanel({ messages, profile, busy, opportunityChips, onSend, onRegenerate }: Props) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = input.trim();
    if (!t || busy) return;
    onSend(t);
    setInput("");
  }

  function startVoice() {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript?: string } } } }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript?: string } } } }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        start: () => void;
      };
    };
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) {
      setInput((v) => v + (v ? " " : "") + "[Voice: use Chrome or Edge]");
      return;
    }
    const rec = new SR();
    rec.lang = profile.language.toLowerCase().includes("hindi") ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript;
      if (text) setInput((v) => (v ? `${v} ${text}` : text));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="flex flex-col h-full min-h-[min(480px,65dvh)] sm:min-h-[480px] glass-panel rounded-2xl overflow-hidden border border-border/80">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/80 bg-card/50">
        <AiOrb size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">EARNGEN Mentor</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {profile.interests.slice(0, 2).join(" · ") || "Career AI"} · ₹{profile.incomeTarget.toLocaleString("en-IN")} goal
          </p>
        </div>
        {lastAssistant && !busy ? (
          <button
            type="button"
            onClick={onRegenerate}
            title="Regenerate last answer"
            className="size-9 rounded-lg ring-1 ring-border grid place-items-center hover:bg-muted text-muted-foreground"
          >
            <RefreshCw className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3 fade-up", m.role === "user" ? "flex-row-reverse" : "")}>
            {m.role === "assistant" ? <AiOrb size="sm" className="shrink-0 mt-1" /> : null}
            <div
              className={cn(
                "max-w-[min(85%,100%)] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
                m.role === "user"
                  ? "bg-foreground text-background rounded-br-md"
                  : "glass-panel rounded-bl-md text-foreground",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy ? <TypingIndicator /> : null}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-border/80 bg-card/40 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {opportunityChips?.map((q) => (
            <button
              key={q}
              type="button"
              disabled={busy}
              onClick={() => onSend(q)}
              className="text-[11px] font-medium rounded-full px-2.5 py-1 ring-1 ring-brand/40 bg-brand/10 text-brand hover:bg-brand/20 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={busy}
              onClick={() => onSend(q)}
              className="text-[11px] font-medium rounded-full px-2.5 py-1 ring-1 ring-border bg-background/80 hover:ring-brand/40 hover:text-brand disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2 items-end">
          <button
            type="button"
            onClick={startVoice}
            className={cn(
              "size-11 shrink-0 rounded-xl ring-1 ring-border grid place-items-center transition",
              listening ? "bg-brand text-brand-foreground ring-brand animate-pulse" : "hover:bg-muted",
            )}
            title="Voice input"
          >
            <Mic className="size-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask your AI mentor anything…"
            className="flex-1 min-h-[44px] max-h-32 rounded-xl bg-background/90 ring-1 ring-border px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-brand outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="size-11 shrink-0 rounded-xl bg-gradient-to-br from-brand to-brand-light text-white grid place-items-center disabled:opacity-40 shadow-lg shadow-brand/25 hover:scale-105 transition-transform"
          >
            {busy ? <Sparkles className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
