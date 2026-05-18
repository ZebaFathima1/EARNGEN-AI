import { xpForLevel } from "@/lib/platform/mock-data";
import { cn } from "@/lib/utils";

export function XpBar({ xp, level, className }: { xp: number; level: number; className?: string }) {
  const currentFloor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = Math.min(100, Math.round(((xp - currentFloor) / (next - currentFloor)) * 100));

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-brand">Level {level}</span>
        <span className="text-muted-foreground">{xp.toLocaleString()} XP</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light xp-bar-fill transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{next - xp} XP to level {level + 1}</p>
    </div>
  );
}
