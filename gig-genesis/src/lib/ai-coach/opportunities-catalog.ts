/** Curated opportunity catalog — match engine maps profile → actionable items with apply links. */

export type OpportunityType =
  | "freelance_gig"
  | "internship"
  | "hackathon"
  | "remote_job"
  | "startup_program"
  | "community"
  | "scholarship"
  | "competition"
  | "creator"
  | "passive"
  | "nearby";

export type CatalogOpportunity = {
  id: string;
  title: string;
  type: OpportunityType;
  platform: string;
  description: string;
  howToEarn: string;
  minEarning: number;
  maxEarning: number;
  difficulty: "Easy" | "Medium" | "Hard";
  daysToAchieve: number;
  applyUrl: string;
  tags: string[];
  remote: boolean;
};

export const PLATFORM_CATALOG: {
  name: string;
  url: string;
  tags: string[];
  whyTemplate: string;
}[] = [
  { name: "Fiverr", url: "https://www.fiverr.com", tags: ["design", "ai", "editing", "writing", "freelance"], whyTemplate: "Fast first gigs with clear packages — ideal for {level} creators selling {interest} services." },
  { name: "Upwork", url: "https://www.upwork.com", tags: ["coding", "writing", "design", "business", "freelance"], whyTemplate: "Higher-ticket client work; strong for {interest} freelancers building long-term clients." },
  { name: "LinkedIn", url: "https://www.linkedin.com/jobs", tags: ["internship", "remote job", "business", "marketing"], whyTemplate: "Best for internships, remote roles, and founder DMs in {city}." },
  { name: "Internshala", url: "https://internshala.com", tags: ["internship", "remote job", "marketing", "coding"], whyTemplate: "India-focused internships matched to students — filter by {interest}." },
  { name: "Unstop", url: "https://unstop.com", tags: ["hackathon", "internship", "competition", "startup"], whyTemplate: "Hackathons + startup competitions with stipends — great for {level} builders." },
  { name: "Freelancer", url: "https://www.freelancer.com", tags: ["coding", "design", "freelance"], whyTemplate: "Bid on projects; useful when you want volume while learning {interest}." },
  { name: "Behance", url: "https://www.behance.net", tags: ["design", "portfolio"], whyTemplate: "Portfolio discovery for designers — drives inbound clients for visual work." },
  { name: "GitHub", url: "https://github.com", tags: ["coding", "open source", "startup"], whyTemplate: "Proof of code quality; essential for dev internships and remote roles." },
  { name: "Product Hunt", url: "https://www.producthunt.com", tags: ["startup", "marketing", "ai"], whyTemplate: "Launch student projects, get startup exposure, and find early-stage gigs." },
  { name: "Topmate", url: "https://topmate.io", tags: ["teaching", "mentoring", "passive"], whyTemplate: "Monetize 1:1 calls — fastest path if you already know {interest} basics." },
  { name: "Gumroad", url: "https://gumroad.com", tags: ["passive", "design", "writing", "ai"], whyTemplate: "Sell templates, prompts, and digital products for recurring passive income." },
  { name: "YouTube", url: "https://www.youtube.com", tags: ["creator", "editing", "content"], whyTemplate: "Learn + build authority; pairs with thumbnail/editing gigs." },
];

export const OPPORTUNITY_CATALOG: CatalogOpportunity[] = [
  {
    id: "opp-ai-thumb",
    title: "AI Thumbnail Designer",
    type: "freelance_gig",
    platform: "Fiverr",
    description: "Design high-CTR YouTube thumbnails using AI + Canva for creators.",
    howToEarn: "Create 3 sample thumbnails, list a ₹499 starter gig, upsell monthly packs.",
    minEarning: 3000,
    maxEarning: 15000,
    difficulty: "Easy",
    daysToAchieve: 5,
    applyUrl: "https://www.fiverr.com/search/gigs?query=ai%20thumbnail",
    tags: ["ai", "design", "editing", "creator"],
    remote: true,
  },
  {
    id: "opp-canva-templates",
    title: "Canva Template Seller",
    type: "passive",
    platform: "Gumroad",
    description: "Sell Notion/Canva template packs to students and small businesses.",
    howToEarn: "Build 5 templates, price ₹199–₹999, promote on Instagram + LinkedIn.",
    minEarning: 2000,
    maxEarning: 20000,
    difficulty: "Easy",
    daysToAchieve: 10,
    applyUrl: "https://gumroad.com",
    tags: ["design", "business", "passive", "canva"],
    remote: true,
  },
  {
    id: "opp-ui-freelance",
    title: "UI Design for Startups",
    type: "freelance_gig",
    platform: "Upwork",
    description: "Landing pages and app screens for early-stage founders.",
    howToEarn: "Portfolio on Behance + 10 Upwork proposals/week with Loom samples.",
    minEarning: 8000,
    maxEarning: 40000,
    difficulty: "Medium",
    daysToAchieve: 14,
    applyUrl: "https://www.upwork.com/nx/search/jobs/?q=ui%20design",
    tags: ["design", "coding", "startup", "figma"],
    remote: true,
  },
  {
    id: "opp-content-intern",
    title: "Content / Social Intern",
    type: "internship",
    platform: "Internshala",
    description: "Part-time content roles at D2C and edtech brands.",
    howToEarn: "Apply with 3 writing samples + metrics from any campus project.",
    minEarning: 3000,
    maxEarning: 12000,
    difficulty: "Easy",
    daysToAchieve: 21,
    applyUrl: "https://internshala.com/internships/content-writing-internship",
    tags: ["writing", "marketing", "content", "internship"],
    remote: true,
  },
  {
    id: "opp-dev-intern",
    title: "Developer Intern (Remote)",
    type: "internship",
    platform: "LinkedIn",
    description: "React/Node/Python internships at startups.",
    howToEarn: "GitHub README + 1 weekend project per application; DM founders directly.",
    minEarning: 10000,
    maxEarning: 35000,
    difficulty: "Medium",
    daysToAchieve: 30,
    applyUrl: "https://www.linkedin.com/jobs/search/?keywords=developer%20intern",
    tags: ["coding", "internship", "remote job", "javascript", "python"],
    remote: true,
  },
  {
    id: "opp-hackathon",
    title: "Student Hackathons (Prizes + Internships)",
    type: "hackathon",
    platform: "Unstop",
    description: "48–72h build sprints with cash prizes and hiring tracks.",
    howToEarn: "Form a 3-person team, pick AI/design track, ship MVP + demo video.",
    minEarning: 0,
    maxEarning: 100000,
    difficulty: "Medium",
    daysToAchieve: 7,
    applyUrl: "https://unstop.com/hackathons",
    tags: ["hackathon", "coding", "ai", "startup", "competition"],
    remote: true,
  },
  {
    id: "opp-startup-fellow",
    title: "Startup Fellowship / Incubator",
    type: "startup_program",
    platform: "Unstop",
    description: "Early founder programs with mentorship and grants.",
    howToEarn: "Apply with problem statement + 1-page deck + traction screenshot.",
    minEarning: 0,
    maxEarning: 500000,
    difficulty: "Hard",
    daysToAchieve: 45,
    applyUrl: "https://unstop.com/competitions",
    tags: ["startup", "business", "ai"],
    remote: true,
  },
  {
    id: "opp-ugc",
    title: "UGC Creator for D2C Brands",
    type: "creator",
    platform: "Instagram",
    description: "Short authentic videos for brand ads.",
    howToEarn: "Film 2 sample UGC clips, DM 20 D2C brands on Instagram.",
    minEarning: 1500,
    maxEarning: 8000,
    difficulty: "Medium",
    daysToAchieve: 10,
    applyUrl: "https://www.instagram.com",
    tags: ["creator", "content", "marketing", "editing"],
    remote: true,
  },
  {
    id: "opp-ai-automation",
    title: "AI Automation for SMBs",
    type: "freelance_gig",
    platform: "LinkedIn",
    description: "Zapier/Make workflows + GPT integrations for local businesses.",
    howToEarn: "Offer free 15-min audit, sell ₹3.5k setup packages.",
    minEarning: 5000,
    maxEarning: 25000,
    difficulty: "Medium",
    daysToAchieve: 14,
    applyUrl: "https://www.linkedin.com/search/results/content/?keywords=ai%20automation%20freelance",
    tags: ["ai", "business", "coding", "automation"],
    remote: true,
  },
  {
    id: "opp-scholarship",
    title: "Merit Scholarships & Grants",
    type: "scholarship",
    platform: "Unstop",
    description: "Competitions with stipends for students.",
    howToEarn: "Filter by your college tier; submit portfolio + short essay.",
    minEarning: 5000,
    maxEarning: 100000,
    difficulty: "Medium",
    daysToAchieve: 30,
    applyUrl: "https://unstop.com/scholarships",
    tags: ["scholarship", "competition", "business"],
    remote: true,
  },
  {
    id: "opp-python-script",
    title: "Python Automation Scripts",
    type: "freelance_gig",
    platform: "Fiverr",
    description: "Spreadsheet cleaners and scrapers for small businesses.",
    howToEarn: "List 3 fixed-price packages; share Loom demo of script running.",
    minEarning: 2500,
    maxEarning: 12000,
    difficulty: "Medium",
    daysToAchieve: 7,
    applyUrl: "https://www.fiverr.com/search/gigs?query=python%20automation",
    tags: ["coding", "python", "business"],
    remote: true,
  },
  {
    id: "opp-video-edit",
    title: "Reel / Short-form Editor",
    type: "freelance_gig",
    platform: "Fiverr",
    description: "Edit reels for cafes, coaches, and creators.",
    howToEarn: "Edit 1 free sample reel, pitch monthly retainer ₹1.5k–₹4k.",
    minEarning: 2000,
    maxEarning: 10000,
    difficulty: "Easy",
    daysToAchieve: 5,
    applyUrl: "https://www.fiverr.com/search/gigs?query=video%20editing%20reels",
    tags: ["editing", "creator", "content"],
    remote: true,
  },
  {
    id: "opp-nearby-cowork",
    title: "Campus / City Creator Meetups",
    type: "nearby",
    platform: "Meetup",
    description: "Local hackathons, creator jams, and coworking events.",
    howToEarn: "Attend 1 event/week; exchange skills with peers in person.",
    minEarning: 0,
    maxEarning: 5000,
    difficulty: "Easy",
    daysToAchieve: 3,
    applyUrl: "https://www.meetup.com/find/?keywords=hackathon%20startup",
    tags: ["nearby", "community", "startup", "network"],
    remote: false,
  },
  {
    id: "opp-discord-ai",
    title: "AI Builder Communities",
    type: "community",
    platform: "Discord / X",
    description: "Find collab partners, beta users, and micro-gigs in AI discords.",
    howToEarn: "Share builds weekly; reply to #looking-for-help with portfolio links.",
    minEarning: 0,
    maxEarning: 15000,
    difficulty: "Easy",
    daysToAchieve: 7,
    applyUrl: "https://discord.com",
    tags: ["ai", "coding", "community", "startup"],
    remote: true,
  },
];

export const NEARBY_EVENTS_CATALOG = [
  { id: "ev1", title: "Weekend Startup Hackathon", type: "hackathon" as const, distanceKm: 4.2, date: "This Sat", venue: "Innovation Hub" },
  { id: "ev2", title: "Design & AI Creator Jam", type: "community" as const, distanceKm: 2.1, date: "Thu 6pm", venue: "Coworking Space" },
  { id: "ev3", title: "Campus Freelancer Meetup", type: "community" as const, distanceKm: 6.8, date: "Next week", venue: "University Incubator" },
  { id: "ev4", title: "Product Demo Day", type: "startup_program" as const, distanceKm: 5.0, date: "Sun", venue: "Tech Park" },
];
