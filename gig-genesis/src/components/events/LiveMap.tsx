import type { LiveEvent } from "@/lib/events/types";
import { cn } from "@/lib/utils";

type Props = {
  events: LiveEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  heatIntensity: number;
};

export function LiveMap({ events, selectedId, onSelect, heatIntensity }: Props) {
  const mapped = events.filter((e) => e.lat != null && e.lng != null).slice(0, 12);
  const fallback = events.slice(0, 8);

  return (
    <div className="relative min-h-[420px] rounded-2xl overflow-hidden ring-1 ring-border">
      <div
        className="absolute inset-0 bg-gradient-to-br from-ink/95 via-ink/90 to-brand/25 dark-map-grid"
        style={{ opacity: 0.85 + heatIntensity * 0.15 }}
      />
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 40%, rgba(16,185,129,${0.15 + heatIntensity * 0.25}) 0%, transparent 45%),
            radial-gradient(circle at 70% 60%, rgba(59,130,246,${0.1 + heatIntensity * 0.2}) 0%, transparent 40%)`,
        }}
      />
      <p className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-widest text-white/80">
        Live opportunity heatmap
      </p>
      <p className="absolute top-3 right-3 z-10 text-[10px] text-brand-light font-semibold animate-pulse">
        ● LIVE
      </p>

      {(mapped.length ? mapped : fallback).map((ev, i) => {
        const left = mapped.length
          ? `${15 + ((ev.lng! + 180) / 360) * 70}%`
          : `${12 + (i % 4) * 22}%`;
        const top = mapped.length ? `${20 + ((90 - ev.lat!) / 180) * 60}%` : `${28 + Math.floor(i / 4) * 24}%`;
        return (
          <button
            key={ev.id}
            type="button"
            title={ev.title}
            onClick={() => onSelect(ev.id)}
            style={{ left, top }}
            className={cn(
              "absolute z-10 size-4 rounded-full border-2 border-white map-marker-live transition-transform",
              ev.type === "hackathon" && "bg-brand",
              ev.type === "internship" && "bg-chart-3",
              ev.type === "networking" && "bg-chart-2",
              !["hackathon", "internship", "networking"].includes(ev.type) && "bg-chart-4",
              selectedId === ev.id && "scale-150 ring-4 ring-brand/60",
            )}
          />
        );
      })}

      <p className="absolute bottom-3 left-3 text-[10px] text-white/70 z-10">
        {events.length} opportunities · auto-refresh
      </p>
    </div>
  );
}
