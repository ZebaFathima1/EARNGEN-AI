import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAiCoachState } from "@/lib/ai-coach/store";
import { buildLearnDashboard, suggestCreators } from "@/lib/learn/recommend-engine";
import { useLearnState } from "@/lib/learn/store";
import { COURSE_CATEGORIES } from "@/lib/learn/types";
import { usePlatformState } from "@/lib/platform/store";
import { FeatureHero } from "@/components/platform/FeatureHero";
import { GlassCard } from "@/components/platform/GlassCard";
import { CourseCarousel } from "./CourseCarousel";
import { ProgressRing } from "./ProgressRing";
import { LearnAssistant } from "./LearnAssistant";
import {
  Award,
  BookOpen,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LearnHub() {
  const { state: coach } = useAiCoachState();
  const { state: learn, toggleBookmark } = useLearnState();
  const { state: platform } = usePlatformState();
  const [category, setCategory] = useState<string | "all">("all");

  const dashboard = useMemo(
    () => buildLearnDashboard(coach.profile, learn),
    [coach.profile, learn],
  );

  const creators = useMemo(() => suggestCreators(coach.profile), [coach.profile]);
  const enrolledIds = new Set(Object.keys(learn.enrolled));
  const bookmarkIds = new Set(learn.bookmarks);
  const g = platform.gamification;

  const totalLessons = Object.values(learn.enrolled).reduce((s, e) => s + e.completedLessonIds.length, 0);
  const certCount = learn.certificates.length;
  const overallProgress =
    dashboard.enrolled.length > 0
      ? Math.round(
          dashboard.continueLearning.reduce((a, c) => a + c.progress, 0) /
            Math.max(1, dashboard.continueLearning.length || dashboard.enrolled.length),
        )
      : 0;

  const filteredCategory =
    category === "all"
      ? dashboard.recommended
      : (dashboard.byCategory[category as keyof typeof dashboard.byCategory] ?? []);

  const profileSummary = [
    coach.profile.interests.join(", "),
    coach.profile.skills,
    coach.profile.goals.join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <FeatureHero
        badge="Learn → Earn OS"
        title="AI Learning & Course Platform"
        subtitle="Coursera depth, YouTube quality, Duolingo streaks — personalized by your Speak with AI profile and wired to gigs, hackathons, and portfolio projects."
      >
        <div className="flex flex-wrap gap-2 text-xs">
          <Link to="/speak-with-ai" className="glass-panel rounded-lg px-3 py-2 font-semibold hover:ring-brand/40">
            Update profile for better picks →
          </Link>
        </div>
      </FeatureHero>

      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {[
          { icon: Zap, label: "XP", value: String(g.xp) },
          { icon: Flame, label: "Streak", value: `${g.streakDays}d` },
          { icon: Award, label: "Badges", value: String(g.earnedBadgeIds.length) },
          { icon: BookOpen, label: "Lessons done", value: String(totalLessons) },
          { icon: GraduationCap, label: "Certificates", value: String(certCount) },
          { icon: Target, label: "Enrolled", value: String(enrolledIds.size) },
        ].map(({ icon: Icon, label, value }) => (
          <GlassCard key={label} className="p-4 text-center">
            <Icon className="size-5 mx-auto text-brand mb-2" />
            <p className="text-lg font-bold">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
          </GlassCard>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <GlassCard className="lg:col-span-2 p-6 flex flex-col sm:flex-row gap-6 items-center">
          <ProgressRing value={overallProgress} size={88} stroke={6} />
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold text-brand uppercase tracking-wider">AI learning insights</p>
            <p className="text-sm text-muted-foreground">{dashboard.insight}</p>
            <p className="text-sm">
              <span className="text-muted-foreground">Next skill: </span>
              <span className="font-semibold text-brand">{dashboard.nextSkill}</span>
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              Top creators for you: {creators.slice(0, 3).join(" · ")}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">Learning roadmap</p>
          <ol className="space-y-2 text-sm">
            {dashboard.recommended.slice(0, 4).map((c, i) => (
              <li key={c.id} className="flex gap-2">
                <span className="text-brand font-bold">{i + 1}.</span>
                <Link to="/learn/$courseId" params={{ courseId: c.id }} className="hover:text-brand line-clamp-1">
                  {c.title}
                </Link>
              </li>
            ))}
          </ol>
        </GlassCard>
      </section>

      {dashboard.continueLearning.length > 0 && (
        <CourseCarousel
          title="Continue learning"
          subtitle="Pick up where you left off"
          courses={dashboard.continueLearning}
          enrolledIds={enrolledIds}
          bookmarkIds={bookmarkIds}
          onBookmark={toggleBookmark}
        />
      )}

      <CourseCarousel
        title="AI recommended for you"
        subtitle="Based on interests, goals, income target & career path"
        courses={dashboard.recommended}
        enrolledIds={enrolledIds}
        bookmarkIds={bookmarkIds}
        onBookmark={toggleBookmark}
      />

      <CourseCarousel
        title="Trending on YouTube"
        subtitle="High-quality free courses — watch in-app"
        courses={dashboard.trending}
        enrolledIds={enrolledIds}
        bookmarkIds={bookmarkIds}
        onBookmark={toggleBookmark}
      />

      <section className="mb-6">
        <p className="text-sm font-semibold mb-3">Browse by category</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition",
              category === "all" ? "bg-brand text-white border-brand" : "border-border hover:border-brand/50",
            )}
          >
            All
          </button>
          {COURSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition",
                category === cat ? "bg-brand text-white border-brand" : "border-border hover:border-brand/50",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <CourseCarousel
        title={category === "all" ? "All courses" : category}
        courses={filteredCategory.length ? filteredCategory : dashboard.recommended}
        enrolledIds={enrolledIds}
        bookmarkIds={bookmarkIds}
        onBookmark={toggleBookmark}
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-brand" />
          AI Learning Mentor
        </h2>
        <LearnAssistant profileSummary={profileSummary} />
      </section>
    </>
  );
}
