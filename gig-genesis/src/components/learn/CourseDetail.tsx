import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getCourse } from "@/lib/learn/catalog";
import { getEarnConnections } from "@/lib/learn/earn-connections";
import { useLearnState } from "@/lib/learn/store";
import { useAiCoachState } from "@/lib/ai-coach/store";
import { scoreCourse } from "@/lib/learn/recommend-engine";
import {
  awardCourseComplete,
  awardLearnStreakDay,
  awardLessonComplete,
} from "@/lib/platform/award-work";
import { GlassCard } from "@/components/platform/GlassCard";
import { YouTubePlayer } from "./YouTubePlayer";
import { LearnAssistant } from "./LearnAssistant";
import { ProgressRing } from "./ProgressRing";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Play,
  Rocket,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CourseDetail({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  const { state: coach } = useAiCoachState();
  const learn = useLearnState();
  const enrollment = learn.getEnrollment(courseId);
  const [activeLessonId, setActiveLessonId] = useState(
    enrollment?.lastLessonId ?? course?.lessons[0]?.id,
  );

  const scored = useMemo(
    () => (course ? scoreCourse(course, coach.profile) : null),
    [course, coach.profile],
  );

  const connections = useMemo(() => (course ? getEarnConnections(course) : []), [course]);

  if (!course) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">Course not found.</p>
        <Link to="/learn" className="text-brand font-semibold mt-4 inline-block">
          ← Back to Learn
        </Link>
      </GlassCard>
    );
  }

  const activeLesson = course.lessons.find((l) => l.id === activeLessonId) ?? course.lessons[0];
  const videoId = activeLesson?.youtubeVideoId ?? course.youtubeVideoId ?? "";
  const done = enrollment?.completedLessonIds.length ?? 0;
  const total = course.lessons.length || 1;
  const progress = Math.round((done / total) * 100);
  const isEnrolled = learn.isEnrolled(courseId);

  function handleEnroll() {
    learn.enroll(courseId);
    if (course.lessons[0]) setActiveLessonId(course.lessons[0].id);
  }

  function handleCompleteLesson() {
    if (!activeLesson || !isEnrolled) return;
    const isNew = learn.completeLesson(courseId, activeLesson.id);
    if (isNew) {
      awardLessonComplete(courseId, activeLesson.id, `${course.title} — ${activeLesson.title}`);
      const today = new Date().toISOString().slice(0, 10);
      awardLearnStreakDay(today);
    }
    const updated = learn.getEnrollment(courseId);
    if (updated && updated.completedLessonIds.length >= total) {
      learn.markCourseComplete(courseId);
      awardCourseComplete(courseId, course.title);
    }
  }

  const profileSummary = `${coach.profile.interests.join(", ")} | ${coach.profile.skills}`;

  return (
    <div className="space-y-8">
      <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand">
        <ArrowLeft className="size-4" />
        Learning hub
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div>
            <p className="text-xs text-brand font-semibold uppercase tracking-wider">{course.category}</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mt-1 text-pretty">{course.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base flex flex-wrap gap-x-1 gap-y-0.5">
              {course.creator} · {course.difficulty} · {course.durationHours}h · {course.views} views
            </p>
            {scored && (
              <p className="text-sm text-brand mt-2 flex items-center gap-1">
                <Star className="size-4 fill-current" />
                AI match {scored.matchPercent}% — {scored.whyMatch}
              </p>
            )}
          </div>

          {videoId && (
            <YouTubePlayer
              videoId={videoId}
              playlistId={course.youtubePlaylistId}
              title={activeLesson?.title ?? course.title}
            />
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {!isEnrolled ? (
              <button
                type="button"
                onClick={handleEnroll}
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white"
              >
                Enroll free
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteLesson}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <CheckCircle2 className="size-4" />
                Mark lesson complete (+XP)
              </button>
            )}
            <button
              type="button"
              onClick={() => learn.toggleBookmark(courseId)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
            >
              {learn.isBookmarked(courseId) ? "Bookmarked" : "Bookmark"}
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>

          <GlassCard className="p-4">
            <h3 className="font-semibold mb-3">Lessons</h3>
            <ul className="space-y-2">
              {course.lessons.map((l) => {
                const completed = enrollment?.completedLessonIds.includes(l.id);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLessonId(l.id);
                        if (isEnrolled) learn.setLastLesson(courseId, l.id);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                        activeLessonId === l.id ? "bg-brand/15 ring-1 ring-brand/40" : "hover:bg-muted/40",
                      )}
                    >
                      {completed ? (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Play className="size-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="flex-1">{l.title}</span>
                      <span className="text-xs text-muted-foreground">{l.durationMin}m</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-5 flex items-center gap-4">
            <ProgressRing value={progress} size={72} />
            <div>
              <p className="font-semibold">Your progress</p>
              <p className="text-xs text-muted-foreground">
                {done}/{total} lessons · {progress}%
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Rocket className="size-4 text-brand" />
              Portfolio projects
            </h3>
            <ul className="space-y-2 text-sm">
              {course.projectIdeas.map((p) => (
                <li key={p} className="text-muted-foreground">
                  · {p}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Briefcase className="size-4 text-brand" />
              Learn → Earn
            </h3>
            <ul className="space-y-2">
              {connections.map((c) => {
                const inner = (
                  <>
                    <ExternalLink className="size-3.5 mt-0.5 text-brand shrink-0" />
                    <div>
                      <p className="font-medium group-hover:text-brand">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                  </>
                );
                return (
                  <li key={c.title + c.href}>
                    {c.href.startsWith("/") ? (
                      <Link to={c.href} className="flex items-start gap-2 rounded-lg p-2 hover:bg-muted/40 text-sm group">
                        {inner}
                      </Link>
                    ) : (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 rounded-lg p-2 hover:bg-muted/40 text-sm group"
                      >
                        {inner}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </GlassCard>

          <LearnAssistant
            courseTitle={course.title}
            lessonTitle={activeLesson?.title}
            profileSummary={profileSummary}
          />
        </div>
      </div>
    </div>
  );
}
