import type { LiveEvent } from "@/lib/events/types";
import { ExternalLink, Link2 } from "lucide-react";

type Props = {
  portals: LiveEvent[];
};

export function DirectApplyLinks({ portals }: Props) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="size-5 text-brand" />
        <h2 className="text-lg font-semibold">Direct apply — ongoing listings</h2>
        </div>
      <p className="text-sm text-muted-foreground mb-4">
        One-click links to platforms with live hackathons, internships, and events open right now.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {portals.map((p) => (
          <a
            key={p.id}
            href={p.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass-panel rounded-xl p-4 ring-1 ring-border hover:ring-brand/50 hover:bg-brand/5 transition flex flex-col"
          >
            <div className="flex justify-between items-start gap-2">
              <span className="text-[10px] font-bold uppercase text-brand">{p.organizer}</span>
              <ExternalLink className="size-4 text-muted-foreground group-hover:text-brand shrink-0" />
            </div>
            <h3 className="font-semibold text-sm mt-2 leading-snug group-hover:text-brand">{p.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-1 flex-1">{p.description}</p>
            <span className="mt-3 inline-flex items-center justify-center rounded-lg bg-foreground text-background text-[11px] font-semibold py-2 px-3 group-hover:brightness-110">
              Open live listings →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
