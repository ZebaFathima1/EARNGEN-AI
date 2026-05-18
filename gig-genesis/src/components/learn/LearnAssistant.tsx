import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askLearnMentor } from "@/lib/learn.functions";
import { GlassCard } from "@/components/platform/GlassCard";
import { Bot, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK = [
  "Explain this lesson in simple terms",
  "Quiz me on 3 questions",
  "What project should I build next?",
  "How do I earn from this skill?",
];

type Msg = { role: "user" | "assistant"; content: string };

export function LearnAssistant({
  courseTitle,
  lessonTitle,
  profileSummary,
}: {
  courseTitle?: string;
  lessonTitle?: string;
  profileSummary?: string;
}) {
  const mentor = useServerFn(askLearnMentor);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "I'm your AI learning mentor — ask for explanations, quizzes, notes, or your next earning step.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const { reply, error } = await mentor({
        data: { message: q, courseTitle, lessonTitle, profileSummary },
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: error || reply || "No response from mentor." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Couldn't reach the mentor. Check GROQ_API_KEY and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="flex flex-col h-[420px] md:h-[480px]">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <Bot className="size-5 text-brand" />
        <div>
          <p className="font-semibold text-sm">AI Learning Mentor</p>
          <p className="text-[10px] text-muted-foreground">Tutor · career guide · quiz master</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl px-3 py-2 max-w-[95%]",
              m.role === "user" ? "ml-auto bg-brand/20 text-foreground" : "bg-muted/40 text-muted-foreground",
            )}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="size-4 animate-spin" />
            Thinking…
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="text-[10px] rounded-full border border-border/60 px-2 py-1 hover:border-brand/50"
          >
            {q}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 p-3 border-t border-border/50"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this course…"
          className="flex-1 rounded-xl bg-muted/30 border border-border/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand px-3 py-2 text-white disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
    </GlassCard>
  );
}
