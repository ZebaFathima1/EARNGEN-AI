import { useEffect, useState } from "react";
import type { EnrolledCourse, LearnState } from "./types";

const KEY = "earngen.learn.v1";

const seed: LearnState = {
  enrolled: {},
  bookmarks: [],
  certificates: [],
};

const listeners = new Set<() => void>();

function read(): LearnState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return { ...seed, ...JSON.parse(raw) } as LearnState;
  } catch {
    return seed;
  }
}

function write(s: LearnState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

export function useLearnState() {
  const [state, setState] = useState<LearnState>(read);

  useEffect(() => {
    const sync = () => setState(read());
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return {
    state,
    enroll(courseId: string) {
      const next = read();
      if (next.enrolled[courseId]) return;
      next.enrolled[courseId] = {
        courseId,
        enrolledAt: new Date().toISOString(),
        completedLessonIds: [],
      };
      write(next);
    },
    unenroll(courseId: string) {
      const next = read();
      delete next.enrolled[courseId];
      write(next);
    },
    toggleBookmark(courseId: string) {
      const next = read();
      if (next.bookmarks.includes(courseId)) {
        next.bookmarks = next.bookmarks.filter((id) => id !== courseId);
      } else {
        next.bookmarks = [...next.bookmarks, courseId];
      }
      write(next);
    },
    completeLesson(courseId: string, lessonId: string) {
      const next = read();
      const e = next.enrolled[courseId];
      if (!e) return false;
      if (e.completedLessonIds.includes(lessonId)) return false;
      e.completedLessonIds.push(lessonId);
      e.lastLessonId = lessonId;
      write(next);
      return true;
    },
    setLastLesson(courseId: string, lessonId: string) {
      const next = read();
      const e = next.enrolled[courseId];
      if (!e) return;
      e.lastLessonId = lessonId;
      write(next);
    },
    markCourseComplete(courseId: string) {
      const next = read();
      const e = next.enrolled[courseId];
      if (!e) return;
      e.completedAt = new Date().toISOString();
      if (!next.certificates.includes(courseId)) {
        next.certificates.push(courseId);
      }
      write(next);
    },
    isEnrolled(courseId: string) {
      return !!read().enrolled[courseId];
    },
    isBookmarked(courseId: string) {
      return read().bookmarks.includes(courseId);
    },
    getEnrollment(courseId: string): EnrolledCourse | undefined {
      return read().enrolled[courseId];
    },
  };
}
