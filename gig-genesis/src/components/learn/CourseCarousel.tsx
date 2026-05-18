import { CourseCard } from "./CourseCard";
import type { ScoredCourse } from "@/lib/learn/types";

export function CourseCarousel({
  title,
  subtitle,
  courses,
  enrolledIds,
  bookmarkIds,
  onBookmark,
}: {
  title: string;
  subtitle?: string;
  courses: ScoredCourse[];
  enrolledIds?: Set<string>;
  bookmarkIds?: Set<string>;
  onBookmark?: (id: string) => void;
}) {
  if (!courses.length) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 px-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {courses.map((c) => (
          <div key={c.id} className="snap-start">
            <CourseCard
              course={c}
              enrolled={enrolledIds?.has(c.id)}
              bookmarked={bookmarkIds?.has(c.id)}
              onBookmark={() => onBookmark?.(c.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
