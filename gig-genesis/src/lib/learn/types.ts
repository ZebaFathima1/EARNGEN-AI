export const COURSE_CATEGORIES = [
  "Artificial Intelligence",
  "Prompt Engineering",
  "UI/UX Design",
  "Video Editing",
  "Graphic Design",
  "Web Development",
  "App Development",
  "Freelancing",
  "Startup Building",
  "Marketing",
  "Content Creation",
  "Data Science",
  "Cybersecurity",
  "No-Code Tools",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export type CourseDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type CourseLesson = {
  id: string;
  title: string;
  youtubeVideoId: string;
  durationMin: number;
};

export type Course = {
  id: string;
  title: string;
  creator: string;
  category: CourseCategory;
  description: string;
  thumbnail: string;
  difficulty: CourseDifficulty;
  durationHours: number;
  rating: number;
  views: string;
  youtubeVideoId?: string;
  youtubePlaylistId?: string;
  lessons: CourseLesson[];
  tags: string[];
  earningTags: string[];
  projectIdeas: string[];
  free: boolean;
};

export type EnrolledCourse = {
  courseId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  lastLessonId?: string;
  completedAt?: string;
};

export type LearnState = {
  enrolled: Record<string, EnrolledCourse>;
  bookmarks: string[];
  certificates: string[];
};

export type ScoredCourse = Course & {
  matchPercent: number;
  whyMatch: string;
};

export type LearnDashboard = {
  recommended: ScoredCourse[];
  trending: ScoredCourse[];
  continueLearning: (ScoredCourse & { progress: number })[];
  enrolled: ScoredCourse[];
  byCategory: Record<CourseCategory, ScoredCourse[]>;
  nextSkill: string;
  insight: string;
};
