import type { PlatformState } from "./types";

const KEY = "earngen.platform.v1";

export const platformSeed: PlatformState = {
  gamification: {
    xp: 0,
    level: 1,
    streakDays: 0,
    skillScore: 0,
    earnedBadgeIds: [],
    completedChallengeIds: [],
  },
  exchanges: [],
  locationSharing: false,
  nearbyRadiusKm: 10,
  wallet: {
    balanceInr: 0,
    pendingInr: 0,
    transactions: [],
  },
  ndas: [],
  redemptions: [],
  rewardPoints: 0,
  awardedWorkIds: [],
  pointsLedger: [],
};

const listeners = new Set<() => void>();

export function readPlatform(): PlatformState {
  if (typeof window === "undefined") return platformSeed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return platformSeed;
    const parsed = JSON.parse(raw) as Partial<PlatformState> & { workRewardsV2?: boolean };
    const hadDemoPoints =
      !parsed.workRewardsV2 &&
      (parsed.rewardPoints ?? 0) > 0 &&
      (!parsed.pointsLedger || parsed.pointsLedger.length === 0) &&
      (!parsed.awardedWorkIds || parsed.awardedWorkIds.length === 0);

    if (hadDemoPoints) {
      parsed.rewardPoints = 0;
      parsed.gamification = { ...platformSeed.gamification, ...(parsed.gamification ?? {}), xp: 0, level: 1, streakDays: 0, skillScore: 0, earnedBadgeIds: [], completedChallengeIds: [] };
    }

    return {
      ...platformSeed,
      ...parsed,
      workRewardsV2: true,
      gamification: { ...platformSeed.gamification, ...parsed.gamification },
      wallet: { ...platformSeed.wallet, ...parsed.wallet },
      awardedWorkIds: parsed.awardedWorkIds ?? [],
      pointsLedger: parsed.pointsLedger ?? [],
    };
  } catch {
    return platformSeed;
  }
}

export function writePlatform(s: PlatformState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

export function subscribePlatform(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
