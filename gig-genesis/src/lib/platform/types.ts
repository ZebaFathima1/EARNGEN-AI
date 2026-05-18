export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  xpReward: number;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badgeId?: string;
};

export type SkillExchange = {
  id: string;
  offeredSkill: string;
  wantedSkill: string;
  partnerName?: string;
  status: "open" | "matched" | "in_progress" | "completed";
  xpReward: number;
  createdAt: string;
};

export type NearbyPerson = {
  id: string;
  name: string;
  skills: string[];
  distanceKm: number;
  availability: "available" | "busy" | "open_to_collab";
  lat: number;
  lng: number;
  trustScore: number;
  level: number;
};

export type Transaction = {
  id: string;
  type: "send" | "receive" | "milestone" | "escrow_hold" | "escrow_release" | "withdraw";
  amount: number;
  counterparty: string;
  status: "pending" | "completed" | "held";
  note?: string;
  createdAt: string;
};

export type NdaAgreement = {
  id: string;
  projectTitle: string;
  counterparty: string;
  status: "draft" | "pending_signature" | "signed";
  trustScoreDelta: number;
  createdAt: string;
  signedAt?: string;
};

export type MarketplaceReward = {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsCost: number;
  partnerBrand: string;
  imageEmoji: string;
  limited?: boolean;
};

export type Redemption = {
  id: string;
  rewardId: string;
  title: string;
  pointsSpent: number;
  createdAt: string;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  xp: number;
  level: number;
  skillScore: number;
  streak: number;
  isYou?: boolean;
};

export type PointsLedgerEntry = {
  id: string;
  workEventId: string;
  title: string;
  detail?: string;
  points: number;
  xp: number;
  source: "sprint" | "income" | "exchange" | "nda" | "learn" | "other";
  createdAt: string;
  badgeId?: string;
  challengeId?: string;
};

export type GamificationState = {
  xp: number;
  level: number;
  streakDays: number;
  skillScore: number;
  earnedBadgeIds: string[];
  completedChallengeIds: string[];
  lastActiveDate?: string;
};

export type WalletState = {
  balanceInr: number;
  pendingInr: number;
  transactions: Transaction[];
};

export type PlatformState = {
  gamification: GamificationState;
  exchanges: SkillExchange[];
  locationSharing: boolean;
  nearbyRadiusKm: number;
  wallet: WalletState;
  ndas: NdaAgreement[];
  redemptions: Redemption[];
  rewardPoints: number;
  /** Prevents double-awarding for the same completed work */
  awardedWorkIds: string[];
  pointsLedger: PointsLedgerEntry[];
};
