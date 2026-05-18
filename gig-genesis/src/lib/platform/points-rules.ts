/** Points & XP are only granted for verified work — see award-work.ts */

export const POINTS = {
  sprintDay: { points: 20, xp: 40, label: "Sprint day completed" },
  sprintComplete: { points: 120, xp: 200, label: "7-day sprint finished" },
  incomePer100: { pointsPer100: 8, xpPer100: 10, min: 15, max: 400, label: "Income logged" },
  exchangeComplete: { points: 80, xp: 120, label: "Skill exchange completed" },
  ndaSigned: { points: 60, xp: 90, label: "NDA signed" },
  lessonComplete: { points: 12, xp: 25, label: "Lesson completed" },
  courseComplete: { points: 80, xp: 150, label: "Course certificate earned" },
  learnStreak: { points: 15, xp: 30, label: "Learning streak day" },
} as const;

export function pointsForIncome(amount: number): { points: number; xp: number } {
  const raw = Math.floor(amount / 100) * POINTS.incomePer100.pointsPer100;
  const points = Math.min(POINTS.incomePer100.max, Math.max(POINTS.incomePer100.min, raw));
  const xp = Math.min(POINTS.incomePer100.max + 50, Math.max(POINTS.incomePer100.min + 5, Math.floor(amount / 100) * POINTS.incomePer100.xpPer100));
  return { points, xp };
}
