import { Link } from "@tanstack/react-router";
import { Bookmark, Play, Sparkles, Star } from "lucide-react";
import type { ScoredCourse } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

export function CourseCard({
  course,
  enrolled,
  bookmarked,
  onBookmark,
  compact,
}: {
  course: ScoredCourse;
  enrolled?: boolean;
  bookmarked?: boolean;
  onBookmark?: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md transition-all duration-300",
        "hover:border-brand/40 hover:shadow-[0_0_40px_-12px_var(--color-brand)]",
        compact
          ? "w-[min(220px,78vw)]"
          : "w-[min(280px,85vw)] sm:w-[280px]",
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={course.thumbnail} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className="absolute top-2 left-2 rounded-full bg-brand/90 px-2 py-0.5 text-[10px] font-bold text-white">
          AI {course.matchPercent}%
        </span>
        {enrolled && (
          <span className="absolute top-2 right-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
            Enrolled
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBookmark?.();
          }}
          className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
          aria-label="Bookmark"
        >
          <Bookmark className={cn("size-4", bookmarked && "fill-current text-brand")} />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{course.category}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{course.title}</h3>
        <p className="text-xs text-muted-foreground">{course.creator}</p>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
          <span>{course.views} views</span>
          <span>{course.difficulty}</span>
          <span>{course.durationHours}h</span>
        </div>
        {!compact && (
          <p className="text-[11px] text-brand/90 flex items-start gap-1">
            <Sparkles className="size-3 shrink-0 mt-0.5" />
            {course.whyMatch}
          </p>
        )}
        <Link
          to="/learn/$courseId"
          params={{ courseId: course.id }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          <Play className="size-3.5" />
          Watch Now
        </Link>
      </div>
    </article>
  );
}
