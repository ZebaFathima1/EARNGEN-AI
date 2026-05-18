import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl shadow-sm",
        glow && "ring-1 ring-brand/25 shadow-[0_0_40px_-12px] shadow-brand/30",
        className,
      )}
    >
      {children}
    </div>
  );
}
