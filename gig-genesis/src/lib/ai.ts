// Deterministic skill-to-gig "AI" engine. Real wow without backend latency.

export type Gig = {
  id: string;
  title: string;
  emoji: string;
  category: "Freelance" | "Local" | "Teaching" | "Content";
  difficulty: "Easy" | "Medium" | "Hard";
  minPrice: number;
  maxPrice: number;
  platforms: string[];
  description: string;
  pitch: string;
  daysToFirstEarn: number;
  matchedSkills: string[];
};

const CATALOG: Omit<Gig, "matchedSkills">[] = [
  { id: "ig-reels", title: "Instagram Reel Editor for Local Cafes", emoji: "🎬", category: "Local", difficulty: "Easy", minPrice: 800, maxPrice: 2500, platforms: ["WhatsApp", "Instagram DM"], description: "Edit 4-5 short-form reels per month for cafes, salons, and gyms in your city.", pitch: "Hi! I noticed your reels could pull more reach. I edit 5 high-retention reels for ₹1,500/month — would love to send you one free sample today.", daysToFirstEarn: 5 },
  { id: "canva-menu", title: "Restaurant Menu & Brand Kit Design", emoji: "🎨", category: "Local", difficulty: "Easy", minPrice: 1200, maxPrice: 3500, platforms: ["WhatsApp", "Direct"], description: "Design clean digital menus + 5 social posts in Canva for local restaurants.", pitch: "Hey! I help restaurants in {city} get a clean digital menu + 5 ready-to-post Instagram designs for ₹1,999. Want a free preview?", daysToFirstEarn: 4 },
  { id: "thumbnails", title: "YouTube Thumbnail Designer", emoji: "🖼️", category: "Freelance", difficulty: "Easy", minPrice: 500, maxPrice: 1500, platforms: ["Fiverr", "Twitter/X"], description: "Design 5-10 high-CTR thumbnails per week for small YouTubers.", pitch: "Loved your last upload — your thumbnail can pull 30% more clicks. I'll design 3 free samples — interested?", daysToFirstEarn: 3 },
  { id: "deck", title: "Pitch Deck & Presentation Designer", emoji: "📊", category: "Freelance", difficulty: "Medium", minPrice: 2500, maxPrice: 8000, platforms: ["LinkedIn", "Upwork"], description: "Polish startup pitch decks and corporate presentations — high-margin work.", pitch: "Hi! I redesign founder decks to look like Notion / Linear-grade. ₹3,500 for a 12-slide rework. Sending one slide sample now.", daysToFirstEarn: 7 },
  { id: "blog", title: "SaaS Blog & Newsletter Writer", emoji: "✍️", category: "Content", difficulty: "Medium", minPrice: 1000, maxPrice: 4000, platforms: ["LinkedIn", "Email"], description: "Write SEO blog posts and weekly newsletters for SaaS and D2C founders.", pitch: "Hey {name}, I write SEO posts ranking on month 1. Quick sample on your niche — want me to send one?", daysToFirstEarn: 6 },
  { id: "py-script", title: "Automation Scripts for Small Businesses", emoji: "🐍", category: "Freelance", difficulty: "Medium", minPrice: 2000, maxPrice: 6000, platforms: ["Upwork", "WhatsApp"], description: "Sell Python scripts that scrape, clean, or automate spreadsheets.", pitch: "Hi! I build small automations (CSV cleaning, scrapers) that save 10+ hours/week. ₹2,500 flat. Want a 5-minute demo?", daysToFirstEarn: 7 },
  { id: "java-api", title: "Java / Spring Boot API Fixes & Small Features", emoji: "☕", category: "Freelance", difficulty: "Medium", minPrice: 2500, maxPrice: 8000, platforms: ["Upwork", "LinkedIn"], description: "Bugfixes, CRUD endpoints, and small Spring Boot / Java backend tasks for startups.", pitch: "Hi! I'm a Java dev — I ship small API fixes and Spring Boot features with tests. ₹3k for a scoped 1–2 day task. Want a quick Loom walkthrough?", daysToFirstEarn: 7 },
  { id: "js-automation", title: "JavaScript / Node.js Scripts & Mini Tools", emoji: "⚡", category: "Freelance", difficulty: "Medium", minPrice: 1500, maxPrice: 5500, platforms: ["Fiverr", "Upwork"], description: "Node scripts, browser snippets, and lightweight JS tooling for founders and agencies.", pitch: "Hey! I write tight Node/JS scripts (scrapers, CSV transforms, cron jobs). ₹2k flat for a well-defined task — can I send a 2-min demo?", daysToFirstEarn: 6 },
  { id: "tutor", title: "Tutoring on Topmate / Superprof", emoji: "🎓", category: "Teaching", difficulty: "Easy", minPrice: 300, maxPrice: 1200, platforms: ["Topmate", "Superprof"], description: "30-60 min 1:1 sessions teaching what you already know.", pitch: "Booking 3 free intro sessions this week — happy to teach you {skill}. Reply to grab a slot.", daysToFirstEarn: 3 },
  { id: "ugc", title: "UGC Creator for D2C Brands", emoji: "📱", category: "Content", difficulty: "Medium", minPrice: 1500, maxPrice: 5000, platforms: ["Instagram", "Email"], description: "Film raw user-style videos for D2C brands — they love authentic students.", pitch: "Hi! I'm a 21-yr-old creator in {city}. I'd love to shoot 2 UGC videos for your brand at ₹1,500 each — sending portfolio.", daysToFirstEarn: 8 },
  { id: "logo", title: "Logo Design Sprints", emoji: "🪄", category: "Freelance", difficulty: "Easy", minPrice: 800, maxPrice: 2500, platforms: ["Fiverr", "Instagram"], description: "48-hour logo sprints for new founders and Instagram shops.", pitch: "Need a logo this weekend? ₹999, 2 concepts, unlimited revisions. Reply YES.", daysToFirstEarn: 4 },
  { id: "video-edit", title: "Long-form YouTube Editor", emoji: "🎞️", category: "Freelance", difficulty: "Medium", minPrice: 2000, maxPrice: 7000, platforms: ["Twitter/X", "Reddit"], description: "Edit 2 long-form videos/week for finance, tech, and education channels.", pitch: "Hey! I noticed your edits could be tighter — sending you a free 60s edit of your last video. Cool?", daysToFirstEarn: 7 },
  { id: "canva-freelance", title: "Canva Designer for Brands & Creators", emoji: "🎨", category: "Freelance", difficulty: "Easy", minPrice: 800, maxPrice: 3000, platforms: ["Fiverr", "Instagram", "WhatsApp"], description: "Create social media kits, pitch decks, ebooks, and brand assets using Canva for startups and creators.", pitch: "Hi! I design scroll-stopping Canva graphics — brand kits, social posts, ebooks — starting at ₹999. Want a free sample today?", daysToFirstEarn: 3 },
  { id: "video-edit-reels", title: "Video Editing for Creators & Brands", emoji: "🎬", category: "Freelance", difficulty: "Medium", minPrice: 1500, maxPrice: 6000, platforms: ["Fiverr", "Instagram DM", "WhatsApp"], description: "Edit short & long-form videos — Reels, YouTube clips, and brand videos with captions, transitions, and effects.", pitch: "Hey! I edit crisp videos with captions, transitions, and music. Send me your raw footage — free test edit on me.", daysToFirstEarn: 5 },
  { id: "ai-thumbnail", title: "AI Thumbnail Design for YouTubers", emoji: "🖼️", category: "Freelance", difficulty: "Easy", minPrice: 300, maxPrice: 1200, platforms: ["Fiverr", "Twitter/X", "YouTube Community"], description: "Design high-CTR thumbnails using AI tools (Midjourney, Ideogram) + Canva for YouTubers and course creators.", pitch: "Your last thumbnail could 2x your CTR. I'll redesign it using AI — free first one. Want to see the result?", daysToFirstEarn: 2 },
  { id: "ai-automation", title: "AI Automation & Workflow Setup", emoji: "🤖", category: "Freelance", difficulty: "Medium", minPrice: 3000, maxPrice: 12000, platforms: ["LinkedIn", "Upwork", "WhatsApp"], description: "Build AI-powered automations using Make, Zapier, n8n, or GPT APIs for founders and small businesses.", pitch: "Hi! I automate repetitive tasks using AI tools — lead capture, email follow-ups, content scheduling. ₹3,500 setup. Want a 15-min demo?", daysToFirstEarn: 7 },
  { id: "landing-page", title: "Landing Page Design & Deployment", emoji: "🌐", category: "Freelance", difficulty: "Medium", minPrice: 5000, maxPrice: 20000, platforms: ["LinkedIn", "Upwork", "WhatsApp"], description: "Design and ship fast-loading, mobile-first landing pages for founders, D2C brands, and local businesses.", pitch: "Hi! I build clean landing pages that convert. ₹5,000 for a fully deployed page in 5 days. Want to see samples?", daysToFirstEarn: 7 },
  { id: "api-integration", title: "API Integrations & Webhooks", emoji: "🔗", category: "Freelance", difficulty: "Hard", minPrice: 4000, maxPrice: 15000, platforms: ["Upwork", "LinkedIn", "Freelancer"], description: "Connect apps using REST APIs, webhooks, and third-party SDKs for startups and agencies.", pitch: "Hey! I integrate payment gateways, CRMs, and third-party tools via APIs. ₹4k for a clean integration. Want to discuss your stack?", daysToFirstEarn: 8 },
  { id: "notion-setup", title: "Notion Workspace Setup & Templates", emoji: "📒", category: "Freelance", difficulty: "Easy", minPrice: 1500, maxPrice: 5000, platforms: ["LinkedIn", "Twitter/X", "Gumroad"], description: "Build custom Notion dashboards, CRMs, project trackers, and second-brain systems for founders and teams.", pitch: "Hi! I set up Notion systems that actually get used — team wikis, CRMs, launch checklists. ₹1,999 flat. Want a free template preview?", daysToFirstEarn: 3 },
  { id: "tech-docs", title: "Technical Documentation Writing", emoji: "📄", category: "Content", difficulty: "Medium", minPrice: 2000, maxPrice: 8000, platforms: ["Upwork", "LinkedIn", "Email"], description: "Write clear API docs, README files, user guides, and developer wikis for startups and open-source projects.", pitch: "Hi! I write developer docs that actually get read — API references, READMEs, onboarding guides. ₹2,500 for a scoped doc. Interested?", daysToFirstEarn: 6 },
  { id: "linkedin-brand", title: "LinkedIn Branding & Content Strategy", emoji: "💼", category: "Content", difficulty: "Medium", minPrice: 2000, maxPrice: 7000, platforms: ["LinkedIn", "Email"], description: "Optimize LinkedIn profiles and write 8-12 posts/month for founders, developers, and working professionals.", pitch: "Hey! Your LinkedIn can pull 10x more reach with the right content. I'll revamp your profile + write 4 posts — first week free. Interested?", daysToFirstEarn: 5 },
];

const SKILL_MAP: Record<string, string[]> = {
  canva: ["canva-freelance", "canva-menu", "thumbnails", "deck", "logo"],
  "canva design": ["canva-freelance", "canva-menu", "logo", "thumbnails"],
  "canva designing": ["canva-freelance", "canva-menu", "logo", "thumbnails"],
  design: ["deck", "logo", "canva-freelance", "canva-menu", "thumbnails"],
  figma: ["deck", "logo", "thumbnails"],
  reels: ["ig-reels", "ugc", "video-edit-reels"],
  "video editing": ["video-edit-reels", "video-edit", "ig-reels"],
  "video edit": ["video-edit-reels", "video-edit", "ig-reels"],
  "instagram reels": ["ig-reels", "ugc"],
  instagram: ["ig-reels", "ugc", "canva-menu"],
  "content writing": ["blog", "deck"],
  writing: ["blog", "deck"],
  copywriting: ["blog", "deck"],
  python: ["py-script", "tutor"],
  java: ["java-api", "tutor"],
  spring: ["java-api", "tutor"],
  kotlin: ["java-api", "tutor"],
  excel: ["py-script", "tutor"],
  javascript: ["js-automation", "api-integration", "tutor"],
  typescript: ["js-automation", "api-integration", "tutor"],
  node: ["js-automation", "api-integration", "tutor"],
  react: ["js-automation", "landing-page", "tutor"],
  coding: ["py-script", "js-automation", "java-api", "api-integration", "tutor"],
  teaching: ["tutor"],
  english: ["tutor", "blog"],
  photography: ["ugc", "ig-reels"],
  // AI Thumbnail Design
  "ai thumbnail": ["ai-thumbnail", "thumbnails"],
  "ai thumbnail design": ["ai-thumbnail", "thumbnails"],
  thumbnail: ["ai-thumbnail", "thumbnails"],
  thumbnails: ["ai-thumbnail", "thumbnails"],
  // AI Automation
  "ai automation": ["ai-automation", "py-script", "js-automation"],
  automation: ["ai-automation", "py-script", "js-automation"],
  zapier: ["ai-automation"],
  make: ["ai-automation"],
  n8n: ["ai-automation"],
  // Landing Pages
  "landing page": ["landing-page", "canva-freelance"],
  "landing pages": ["landing-page", "canva-freelance"],
  "web design": ["landing-page", "canva-freelance"],
  webdesign: ["landing-page", "canva-freelance"],
  // API Integrations
  "api integration": ["api-integration", "js-automation"],
  "api integrations": ["api-integration", "js-automation"],
  api: ["api-integration", "java-api", "js-automation"],
  webhook: ["api-integration", "js-automation"],
  // Notion Setup
  notion: ["notion-setup"],
  "notion setup": ["notion-setup"],
  "notion template": ["notion-setup"],
  // Technical Documentation
  "technical documentation": ["tech-docs", "blog"],
  "tech docs": ["tech-docs"],
  documentation: ["tech-docs", "blog"],
  readme: ["tech-docs"],
  // LinkedIn Branding
  linkedin: ["linkedin-brand"],
  "linkedin branding": ["linkedin-brand"],
  "linkedin content": ["linkedin-brand", "blog"],
  "personal branding": ["linkedin-brand", "blog"],
};

function norm(s: string) {
  return s.toLowerCase().trim();
}

/** True if needle appears in haystack as a whole word (avoids "java" matching "javascript"). */
function wholeWordIncludes(haystack: string, needle: string): boolean {
  if (!needle.length) return false;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    const before = i === 0 ? " " : haystack[i - 1]!;
    const after = i + needle.length >= haystack.length ? " " : haystack[i + needle.length]!;
    const isWord = (c: string) => /[a-z0-9]/i.test(c);
    if (!isWord(before) && !isWord(after)) return true;
    i += 1;
  }
  return false;
}

function mapKeysForSkill(skillKey: string): string[] {
  if (SKILL_MAP[skillKey]) return SKILL_MAP[skillKey];
  // Longer keys first so "javascript" wins before "java" when the user typed the full word
  const sortedKeys = Object.keys(SKILL_MAP).sort((a, b) => b.length - a.length);
  for (const k of sortedKeys) {
    if (skillKey === k || wholeWordIncludes(skillKey, k)) return SKILL_MAP[k];
  }
  return [];
}

export function gigApplyLinks(gigTitle: string, city = "India") {
  const q = encodeURIComponent(gigTitle);
  const cq = encodeURIComponent(`${gigTitle} ${city}`);
  return {
    fiverr: `https://www.fiverr.com/search/gigs?query=${q}`,
    unstop: `https://unstop.com/jobs?search=${cq}`,
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent("learn " + gigTitle + " tutorial")}`,
  };
}

export function suggestGigs(skills: string[], city = "Hyderabad", name = "there"): Gig[] {
  const ids = new Set<string>();
  const matchMap: Record<string, string[]> = {};
  skills.forEach((s) => {
    const key = norm(s);
    const matched = mapKeysForSkill(key);
    matched.forEach((id) => {
      ids.add(id);
      matchMap[id] = [...(matchMap[id] ?? []), s];
    });
  });
  // Only add a generic fallback when nothing matched (keeps lists on-topic)
  if (ids.size === 0) ["tutor"].forEach((id) => ids.add(id));

  const gigs = Array.from(ids)
    .map((id) => CATALOG.find((g) => g.id === id)!)
    .filter(Boolean)
    .map((g) => ({
      ...g,
      matchedSkills: matchMap[g.id] ?? skills.slice(0, 1),
      pitch: g.pitch
        .replace("{city}", city)
        .replace("{name}", name)
        .replace("{skill}", (matchMap[g.id]?.[0] ?? skills[0] ?? "this")),
    }));

  return gigs.slice(0, 8);
}

export function generateSprintPlan(gig: Gig): { day: number; title: string; detail: string; script?: string }[] {
  return [
    { day: 1, title: "Lock your offer & profile", detail: `Write a one-line offer for "${gig.title}". Set up a free profile on ${gig.platforms[0]}.` },
    { day: 2, title: "Build a 2-sample portfolio", detail: "Create 2 sample deliverables (free, fast). These become your proof for cold outreach." },
    { day: 3, title: "Send 15 cold messages", detail: `Message 15 prospects on ${gig.platforms[0]}. Use the script below.`, script: gig.pitch },
    { day: 4, title: "Follow up + post in groups", detail: "Re-message non-responders. Post your offer in 3 college / WhatsApp groups." },
    { day: 5, title: "Get on a discovery call", detail: "Convert one warm reply to a 10-min call. Ask: budget, deadline, style references." },
    { day: 6, title: "Send a tight quote", detail: `Quote inside ₹${gig.minPrice}–₹${gig.maxPrice}. Ask for 50% advance via UPI.` },
    { day: 7, title: "Deliver + log income", detail: "Deliver clean files. Log payment on EARNGEN-AI to mint your first Proof-of-Work." },
  ];
}

export function generatePoWSummary(skills: string[], totalEarned: number, gigCount: number) {
  const top = skills.slice(0, 3).join(", ");
  return `Verified earner on EARNGEN-AI. Delivered ${gigCount} client projects across ${top}, generating ₹${totalEarned.toLocaleString("en-IN")} in tracked income. Clients report on-time delivery, clear communication, and measurable engagement growth on social channels.`;
}
