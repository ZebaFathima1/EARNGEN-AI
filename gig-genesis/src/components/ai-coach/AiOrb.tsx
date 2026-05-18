import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiOrb({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = size === "lg" ? "size-20" : size === "sm" ? "size-10" : "size-14";
  return (
    <div className={cn("relative grid place-items-center", className)}>
      <div className={cn("absolute inset-0 rounded-full bg-brand/20 blur-xl ai-orb", s)} />
      <div
        className={cn(
          "relative rounded-2xl bg-gradient-to-br from-brand via-brand-light to-chart-2 grid place-items-center text-white shadow-lg ring-2 ring-white/20",
          s,
        )}
      >
        <Sparkles className={size === "lg" ? "size-9" : size === "sm" ? "size-5" : "size-7"} />
      </div>
    </div>
  );
}
