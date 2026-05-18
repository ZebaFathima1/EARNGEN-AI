import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Closed";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

export function CountdownPill({ deadline, className }: { deadline: string; className?: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => setLabel(formatRemaining(new Date(deadline).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [deadline]);

  const urgent = label !== "Closed" && !label.includes("d");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ring-1",
        urgent ? "bg-destructive/10 text-destructive ring-destructive/20" : "bg-brand/10 text-brand ring-brand/20",
        className,
      )}
    >
      <Calendar className="size-3" /> Reg {label}
    </span>
  );
}
