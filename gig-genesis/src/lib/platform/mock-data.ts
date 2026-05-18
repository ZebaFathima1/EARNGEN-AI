import type { Badge, Challenge, LeaderboardEntry, MarketplaceReward, NearbyPerson } from "./types";

export const BADGES: Badge[] = [
  { id: "first-gig", name: "First Gig", description: "Completed your first verified gig", icon: "🚀", tier: "bronze", xpReward: 100 },
  { id: "mentor", name: "Skill Mentor", description: "Helped 3 peers learn a new skill", icon: "🎓", tier: "silver", xpReward: 250 },
  { id: "streak-7", name: "7-Day Streak", description: "Active 7 days in a row", icon: "🔥", tier: "gold", xpReward: 500 },
  { id: "collab-king", name: "Collab King", description: "5 successful skill exchanges", icon: "🤝", tier: "gold", xpReward: 400 },
  { id: "trusted", name: "Verified Contributor", description: "Trust score above 90", icon: "✓", tier: "platinum", xpReward: 750 },
  { id: "nearby-hero", name: "Nearby Hero", description: "Connected with 10 nearby talents", icon: "📍", tier: "silver", xpReward: 300 },
];

export const CHALLENGES: Challenge[] = [
  { id: "exchange-1", title: "First Skill Swap", description: "Post or complete one skill exchange", xpReward: 150, badgeId: "collab-king" },
  { id: "mentor-hour", title: "Mentor Hour", description: "Spend 1 hour mentoring on a call", xpReward: 200, badgeId: "mentor" },
  { id: "nearby-connect", title: "Local Connect", description: "Message someone within 5km", xpReward: 120, badgeId: "nearby-hero" },
  { id: "nda-sign", title: "Trust Builder", description: "Sign a digital NDA for a project", xpReward: 180 },
  { id: "redeem-reward", title: "Reward Hunter", description: "Redeem points in the marketplace", xpReward: 100 },
];

export const MOCK_NEARBY: NearbyPerson[] = [
  { id: "n1", name: "Priya S.", skills: ["UI Design", "Figma"], distanceKm: 1.2, availability: "available", lat: 17.44, lng: 78.35, trustScore: 92, level: 4 },
  { id: "n2", name: "Arjun K.", skills: ["React", "TypeScript"], distanceKm: 2.8, availability: "open_to_collab", lat: 17.42, lng: 78.38, trustScore: 88, level: 5 },
  { id: "n3", name: "Sneha M.", skills: ["Content", "SEO"], distanceKm: 4.1, availability: "busy", lat: 17.46, lng: 78.33, trustScore: 95, level: 6 },
  { id: "n4", name: "Rahul D.", skills: ["Video Edit", "Motion"], distanceKm: 5.5, availability: "available", lat: 17.41, lng: 78.36, trustScore: 86, level: 3 },
  { id: "n5", name: "Ananya R.", skills: ["Python", "Data"], distanceKm: 7.2, availability: "available", lat: 17.48, lng: 78.40, trustScore: 91, level: 5 },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Priya S.", xp: 12400, level: 12, skillScore: 94, streak: 21 },
  { rank: 2, name: "Arjun K.", xp: 10850, level: 11, skillScore: 91, streak: 14 },
  { rank: 3, name: "Sneha M.", xp: 9200, level: 10, skillScore: 96, streak: 18 },
  { rank: 4, name: "You", xp: 0, level: 1, skillScore: 0, streak: 0, isYou: true },
  { rank: 5, name: "Rahul D.", xp: 7100, level: 8, skillScore: 85, streak: 9 },
];

export const MARKETPLACE_REWARDS: MarketplaceReward[] = [
  { id: "spotify", title: "Spotify Premium — 1 month", description: "Stream focus playlists while you sprint", category: "Subscriptions", pointsCost: 800, partnerBrand: "Spotify", imageEmoji: "🎵", limited: true },
  { id: "udemy", title: "Udemy course voucher ₹500", description: "Any course on the platform", category: "Courses", pointsCost: 600, partnerBrand: "Udemy", imageEmoji: "📚" },
  { id: "notion", title: "Notion Plus — 3 months", description: "Organize gigs and client work", category: "Subscriptions", pointsCost: 1200, partnerBrand: "Notion", imageEmoji: "📝" },
  { id: "amazon", title: "Amazon gift card ₹200", description: "Redeem on Amazon India", category: "Coupons", pointsCost: 400, partnerBrand: "Amazon", imageEmoji: "🛒" },
  { id: "pro-month", title: "EARNGEN-AI Pro — 1 month", description: "AI roadmap, priority matching, boosted profile", category: "Premium", pointsCost: 1500, partnerBrand: "EARNGEN-AI", imageEmoji: "⚡" },
  { id: "figma", title: "Figma Education pack", description: "Design resources for students", category: "Courses", pointsCost: 900, partnerBrand: "Figma", imageEmoji: "🎨", limited: true },
];

export function xpForLevel(level: number): number {
  return level * 500 + (level - 1) * 200;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}
