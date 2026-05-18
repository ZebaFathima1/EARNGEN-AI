import type { LiveEvent } from "@/lib/events/types";
import { cn } from "@/lib/utils";
import { Calendar, ExternalLink, MapPin, Trophy, Users } from "lucide-react";
import { CountdownPill } from "./CountdownPill";

const TYPE_LABEL: Record<string, string> = {
  hackathon: "Hackathon",
  startup_event: "Startup",
  ai_conference: "AI Conference",
  coding_competition: "Competition",
  workshop: "Workshop",
  internship: "Internship",
  networking: "Networking",
  creator: "Creator",
  demo_day: "Demo Day",
  community: "Community",
  meetup: "Meetup",
};

type Props = {
  event: LiveEvent;
  selected?: boolean;
  onSelect?: () => void;
  onHackathonPlan?: () => void;
};

export function EventCard({ event, selected, onSelect, onHackathonPlan }: Props) {
  return (
    <article
      className={cn(
        "glass-panel rounded-2xl overflow-hidden ring-1 transition-all cursor-pointer",
        selected ? "ring-brand/50 shadow-[0_0_32px_-8px] shadow-brand/40" : "ring-border hover:ring-brand/30",
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
      role="button"
      tabIndex={0}
    >
      {event.coverImage ? (
        <div className="h-28 bg-muted relative overflow-hidden">
          <img src={event.coverImage} alt="" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <span className="absolute top-2 right-2 text-lg font-bold text-white bg-brand/90 rounded-full size-10 grid place-items-center">
            {event.matchPercent}%
          </span>
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-br from-brand/20 to-chart-2/10 relative flex items-end p-3">
          <span className="ml-auto text-sm font-bold text-brand bg-background/80 rounded-full px-2 py-0.5">
            {event.matchPercent}% match
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold uppercase tracking-wide">
          <span className="text-brand">{TYPE_LABEL[event.type] ?? event.type}</span>
          <span className="text-muted-foreground">{event.source}</span>
          {event.isOnline ? <span className="text-chart-2">Online</span> : <span>Offline</span>}
        </div>
        <h3 className="font-semibold text-sm mt-1.5 leading-snug">{event.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{event.tagline ?? event.description}</p>

        <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-muted-foreground">
          {event.prizePool ? (
            <span className="flex items-center gap-1">
              <Trophy className="size-3 text-brand" /> {event.prizePool}
            </span>
          ) : null}
          {event.participantsCount ? (
            <span className="flex items-center gap-1">
              <Users className="size-3" /> {event.participantsCount}+
            </span>
          ) : null}
          {event.distanceKm != null ? (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {event.distanceKm} km
            </span>
          ) : null}
        </div>

        {event.registrationDeadline ? <CountdownPill deadline={event.registrationDeadline} className="mt-2" /> : null}

        {event.recommendedTeammates?.length ? (
          <p className="text-[10px] mt-2 text-muted-foreground">
            Team fit: {event.recommendedTeammates.join(" · ")}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          <a
            href={event.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1.5 text-[11px] font-semibold"
          >
            {event.id.startsWith("portal-") ? "Open listings" : "Apply now"} <ExternalLink className="size-3" />
          </a>
          {event.type === "hackathon" && onHackathonPlan ? (
            <button
              type="button"
              onClick={onHackathonPlan}
              className="text-[11px] font-semibold rounded-lg ring-1 ring-brand text-brand px-3 py-1.5 hover:bg-brand/10"
            >
              Hackathon plan
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
