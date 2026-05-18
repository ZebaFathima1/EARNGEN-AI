import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FeatureHero({
  title,
  subtitle,
  badge,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-brand/10 via-card to-card p-6 sm:p-8 mb-8 fade-up", className)}>
      <div className="absolute -top-24 -right-24 size-64 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-chart-2/10 blur-3xl pointer-events-none" />
      <div className="relative">
        {badge ? (
          <span className="inline-flex text-[10px] font-bold uppercase tracking-widest text-brand bg-brand/10 ring-1 ring-brand/20 rounded-full px-3 py-1 mb-3">
            {badge}
          </span>
        ) : null}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">{subtitle}</p>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </header>
  );
}
