import { useEffect, useState } from "react";
import type { ChatMessage, StudentProfile } from "./types";
import { LEVEL_OPTIONS } from "./types";

const KEY = "earngen.ai-coach.v1";

export type AiCoachState = {
  onboardingComplete: boolean;
  profile: StudentProfile;
  messages: ChatMessage[];
};

const defaultProfile: StudentProfile = {
  interests: [],
  skills: "",
  goals: [],
  hoursPerDay: 2,
  incomeTarget: 10000,
  level: "Beginner",
  tools: "",
  language: "English",
  workStyle: "",
  priorities: [],
};

const seed: AiCoachState = {
  onboardingComplete: false,
  profile: defaultProfile,
  messages: [],
};

const listeners = new Set<() => void>();

function read(): AiCoachState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return { ...seed, ...JSON.parse(raw) } as AiCoachState;
  } catch {
    return seed;
  }
}

function write(s: AiCoachState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

export function useAiCoachState() {
  const [state, setState] = useState<AiCoachState>(() => read());

  useEffect(() => {
    const l = () => setState(read());
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  return {
    state,
    updateProfile(patch: Partial<StudentProfile>) {
      const next = read();
      next.profile = { ...next.profile, ...patch };
      write(next);
    },
    completeOnboarding(profile: StudentProfile) {
      const next = read();
      next.profile = profile;
      next.onboardingComplete = true;
      next.messages = [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            `Welcome aboard! I've mapped your profile — ${profile.interests.slice(0, 3).join(", ") || "your interests"}, targeting ₹${profile.incomeTarget.toLocaleString("en-IN")}/month with ${profile.hoursPerDay}h/day. Ask me anything, or explore your personalized dashboard below.`,
          createdAt: new Date().toISOString(),
        },
      ];
      write(next);
    },
    addMessage(msg: Omit<ChatMessage, "id" | "createdAt">) {
      const next = read();
      next.messages.push({
        ...msg,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
      write(next);
    },
    setMessages(messages: ChatMessage[]) {
      const next = read();
      next.messages = messages;
      write(next);
    },
    resetOnboarding() {
      write({ ...seed, profile: defaultProfile });
    },
  };
}

export { LEVEL_OPTIONS, defaultProfile };
