import type { Course } from "./types";

export type EarnConnection = {
  type: "gig" | "platform" | "hackathon" | "project" | "internship";
  title: string;
  description: string;
  href: string;
};

const PLATFORM_LINKS: Record<string, EarnConnection[]> = {
  design: [
    { type: "platform", title: "Fiverr — UI/UX gigs", description: "List logo & UI packages", href: "https://www.fiverr.com/categories/graphics-design/ux-ui-design" },
    { type: "platform", title: "Dribbble", description: "Portfolio inspiration", href: "https://dribbble.com/" },
  ],
  freelance: [
    { type: "platform", title: "Upwork", description: "Client projects", href: "https://www.upwork.com/" },
    { type: "platform", title: "Freelancer.com", description: "Bids & contests", href: "https://www.freelancer.com/" },
  ],
  coding: [
    { type: "platform", title: "GitHub", description: "Open source portfolio", href: "https://github.com/" },
    { type: "gig", title: "Toptal / Arc", description: "Remote dev roles", href: "https://arc.dev/" },
  ],
  ai: [
    { type: "gig", title: "Prompt engineering gigs", description: "AI automation on Fiverr", href: "https://www.fiverr.com/search/gigs?query=prompt%20engineering" },
    { type: "project", title: "Build AI SaaS MVP", description: "Ship in 7 days", href: "/sprint" },
  ],
  startup: [
    { type: "hackathon", title: "Live hackathons", description: "Apply to open events", href: "/nearby" },
    { type: "internship", title: "Startup internships", description: "AngelList / Wellfound", href: "https://wellfound.com/" },
  ],
  creator: [
    { type: "platform", title: "YouTube Studio", description: "Monetize content", href: "https://studio.youtube.com/" },
  ],
  marketing: [
    { type: "gig", title: "Social media manager", description: "Local business outreach", href: "/opportunities" },
  ],
};

export function getEarnConnections(course: Course): EarnConnection[] {
  const out: EarnConnection[] = [];
  const seen = new Set<string>();

  for (const tag of course.earningTags) {
    const links = PLATFORM_LINKS[tag] ?? [];
    for (const link of links) {
      const key = link.href + link.title;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(link);
      }
    }
  }

  for (const idea of course.projectIdeas.slice(0, 2)) {
    out.push({
      type: "project",
      title: idea,
      description: "Portfolio piece — add to Proof Vault",
      href: "/proof",
    });
  }

  out.push({
    type: "hackathon",
    title: "EARNGEN live events",
    description: "Hackathons matched to your skills",
    href: "/nearby",
  });

  out.push({
    type: "gig",
    title: "AI-matched opportunities",
    description: "Gigs from your Speak with AI profile",
    href: "/opportunities",
  });

  return out.slice(0, 8);
}
