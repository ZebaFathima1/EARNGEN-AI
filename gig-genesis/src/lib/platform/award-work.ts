import type { AppState } from "@/lib/store";
import { BADGES, CHALLENGES, levelFromXp } from "./mock-data";
import { pointsForIncome, POINTS } from "./points-rules";
import type { PlatformState, PointsLedgerEntry } from "./types";
import { readPlatform, writePlatform } from "./platform-storage";

export type AwardResult = { awarded: boolean; points: number; xp: number };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function bumpStreak(next: PlatformState) {
  const today = todayKey();
  if (next.gamification.lastActiveDate === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  if (next.gamification.lastActiveDate === yKey) {
    next.gamification.streakDays += 1;
  } else if (!next.gamification.lastActiveDate) {
    next.gamification.streakDays = 1;
  } else {
    next.gamification.streakDays = 1;
  }
  next.gamification.lastActiveDate = today;
}

function recalcSkillScore(next: PlatformState, incomeCount: number, sprintDaysDone: number) {
  next.gamification.skillScore = Math.min(100, 35 + incomeCount * 10 + sprintDaysDone * 4 + next.gamification.level * 2);
}

/** Idempotent: each workEventId can only grant rewards once */
export function awardWork(
  workEventId: string,
  entry: Omit<PointsLedgerEntry, "id" | "workEventId" | "createdAt">,
): AwardResult {
  const next = readPlatform();
  if (next.awardedWorkIds.includes(workEventId)) {
    return { awarded: false, points: 0, xp: 0 };
  }

  next.awardedWorkIds.push(workEventId);
  next.rewardPoints += entry.points;
  next.gamification.xp += entry.xp;
  next.gamification.level = levelFromXp(next.gamification.xp);
  next.pointsLedger = [
    {
      id: crypto.randomUUID(),
      workEventId,
      createdAt: new Date().toISOString(),
      ...entry,
    },
    ...next.pointsLedger,
  ].slice(0, 50);

  bumpStreak(next);

  if (entry.badgeId && !next.gamification.earnedBadgeIds.includes(entry.badgeId)) {
    next.gamification.earnedBadgeIds.push(entry.badgeId);
    const badge = BADGES.find((b) => b.id === entry.badgeId);
    if (badge) {
      next.gamification.xp += badge.xpReward;
      next.gamification.level = levelFromXp(next.gamification.xp);
    }
  }

  if (entry.challengeId && !next.gamification.completedChallengeIds.includes(entry.challengeId)) {
    next.gamification.completedChallengeIds.push(entry.challengeId);
  }

  writePlatform(next);
  return { awarded: true, points: entry.points, xp: entry.xp };
}

export function awardSprintDay(sprintKey: string, day: number, gigTitle: string): AwardResult {
  return awardWork(`sprint-day:${sprintKey}:${day}`, {
    title: `${POINTS.sprintDay.label} — Day ${day}`,
    detail: gigTitle,
    points: POINTS.sprintDay.points,
    xp: POINTS.sprintDay.xp,
    source: "sprint",
  });
}

export function awardSprintComplete(sprintKey: string, gigTitle: string): AwardResult {
  return awardWork(`sprint-complete:${sprintKey}`, {
    title: POINTS.sprintComplete.label,
    detail: gigTitle,
    points: POINTS.sprintComplete.points,
    xp: POINTS.sprintComplete.xp,
    source: "sprint",
  });
}

export function awardIncomeLogged(incomeId: string, amount: number, project: string): AwardResult {
  const { points, xp } = pointsForIncome(amount);
  const isFirst = readPlatform().pointsLedger.filter((p) => p.source === "income").length === 0;
  return awardWork(`income:${incomeId}`, {
    title: `${POINTS.incomePer100.label} — ₹${amount.toLocaleString("en-IN")}`,
    detail: project,
    points,
    xp,
    source: "income",
    badgeId: isFirst ? "first-gig" : undefined,
  });
}

export function awardExchangeComplete(exchangeId: string, offered: string, wanted: string): AwardResult {
  const completedCount = readPlatform().exchanges.filter((e) => e.status === "completed").length;
  return awardWork(`exchange:${exchangeId}`, {
    title: POINTS.exchangeComplete.label,
    detail: `${offered} ↔ ${wanted}`,
    points: POINTS.exchangeComplete.points,
    xp: POINTS.exchangeComplete.xp,
    source: "exchange",
    challengeId: "exchange-1",
    badgeId: completedCount >= 5 ? "collab-king" : undefined,
  });
}

export function awardNdaSigned(ndaId: string, projectTitle: string): AwardResult {
  return awardWork(`nda:${ndaId}`, {
    title: POINTS.ndaSigned.label,
    detail: projectTitle,
    points: POINTS.ndaSigned.points,
    xp: POINTS.ndaSigned.xp,
    source: "nda",
    challengeId: "nda-sign",
  });
}

export function awardLessonComplete(courseId: string, lessonId: string, title: string): AwardResult {
  return awardWork(`learn-lesson:${courseId}:${lessonId}`, {
    title: POINTS.lessonComplete.label,
    detail: title,
    points: POINTS.lessonComplete.points,
    xp: POINTS.lessonComplete.xp,
    source: "learn",
  });
}

export function awardCourseComplete(courseId: string, title: string): AwardResult {
  return awardWork(`learn-course:${courseId}`, {
    title: POINTS.courseComplete.label,
    detail: title,
    points: POINTS.courseComplete.points,
    xp: POINTS.courseComplete.xp,
    source: "learn",
  });
}

export function awardLearnStreakDay(dateKey: string): AwardResult {
  return awardWork(`learn-streak:${dateKey}`, {
    title: POINTS.learnStreak.label,
    detail: dateKey,
    points: POINTS.learnStreak.points,
    xp: POINTS.learnStreak.xp,
    source: "learn",
  });
}

/** Backfill rewards for sprint days & income already in app state (idempotent) */
export function syncRewardsFromAppState(app: AppState): void {
  let sprintDaysTotal = 0;

  if (app.sprint) {
    const key = app.sprint.startedAt;
    for (const day of app.sprint.completedDays) {
      sprintDaysTotal += 1;
      awardSprintDay(key, day, app.sprint.gigTitle);
    }
    if (app.sprint.completedDays.length >= 7) {
      awardSprintComplete(key, app.sprint.gigTitle);
    }
  }

  for (const inc of app.income) {
    awardIncomeLogged(inc.id, inc.amount, inc.project);
  }

  const next = readPlatform();
  recalcSkillScore(next, app.income.length, sprintDaysTotal);

  if (next.gamification.streakDays >= 7 && !next.gamification.earnedBadgeIds.includes("streak-7")) {
    next.gamification.earnedBadgeIds.push("streak-7");
    const badge = BADGES.find((b) => b.id === "streak-7");
    if (badge) {
      next.gamification.xp += badge.xpReward;
      next.gamification.level = levelFromXp(next.gamification.xp);
    }
  }

  const completedExchanges = next.exchanges.filter((e) => e.status === "completed");
  for (const ex of completedExchanges) {
    awardExchangeComplete(ex.id, ex.offeredSkill, ex.wantedSkill);
  }

  const signedNdas = next.ndas.filter((n) => n.status === "signed");
  for (const nda of signedNdas) {
    awardNdaSigned(nda.id, nda.projectTitle);
  }

  writePlatform(next);
}

export function getChallengeProgress(app: AppState, platform: PlatformState) {
  return CHALLENGES.map((ch) => {
    const done = platform.gamification.completedChallengeIds.includes(ch.id);
    let locked = true;
    let hint = "Complete the required action to unlock";

    switch (ch.id) {
      case "exchange-1":
        locked = !platform.exchanges.some((e) => e.status === "completed");
        hint = "Mark a skill exchange as completed";
        break;
      case "mentor-hour":
        locked = true;
        hint = "Complete a verified mentor session (coming soon)";
        break;
      case "nearby-connect":
        locked = true;
        hint = "Message a nearby talent from the map (coming soon)";
        break;
      case "nda-sign":
        locked = !platform.ndas.some((n) => n.status === "signed");
        hint = "Sign an NDA in Trust & NDA";
        break;
      case "redeem-reward":
        locked = platform.redemptions.length === 0;
        hint = "Earn points from work, then redeem a reward";
        break;
      default:
        locked = !done;
    }

    return { ...ch, done, locked, hint };
  });
}
