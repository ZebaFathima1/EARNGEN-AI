// Lightweight localStorage-backed store with React subscription.
import { useEffect, useState } from "react";

export type IncomeEntry = {
  id: string;
  amount: number;
  client: string;
  platform: string;
  skill: string;
  project: string;
  date: string; // ISO date
};

export type SprintState = {
  gigTitle: string;
  startedAt: string;
  completedDays: number[]; // 1..7
};

export type AppState = {
  user: { name: string; college: string; city: string };
  skills: string[];
  level: "Beginner" | "Intermediate" | "Pro";
  income: IncomeEntry[];
  sprint: SprintState | null;
};

const KEY = "skillsync.state.v2";

const seed: AppState = {
  user: { name: "", college: "", city: "" },
  skills: [],
  level: "Beginner",
  income: [],
  sprint: null,
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const listeners = new Set<() => void>();

function read(): AppState {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return { ...seed, ...JSON.parse(raw) } as AppState;
  } catch {
    return seed;
  }
}

function write(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l());
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => read());
  useEffect(() => {
    const l = () => setState(read());
    listeners.add(l);
    setState(read());
    return () => {
      listeners.delete(l);
    };
  }, []);

  return {
    state,
    update(patch: Partial<AppState>) {
      write({ ...read(), ...patch });
    },
    addIncome(entry: Omit<IncomeEntry, "id">) {
      const next = read();
      next.income = [{ ...entry, id: crypto.randomUUID() }, ...next.income];
      write(next);
    },
    removeIncome(id: string) {
      const next = read();
      next.income = next.income.filter((e) => e.id !== id);
      write(next);
    },
    setSprint(sprint: SprintState | null) {
      const next = read();
      next.sprint = sprint;
      write(next);
    },
    toggleDay(day: number) {
      const next = read();
      if (!next.sprint) return;
      const set = new Set(next.sprint.completedDays);
      if (set.has(day)) set.delete(day);
      else set.add(day);
      next.sprint.completedDays = Array.from(set).sort((a, b) => a - b);
      write(next);
    },
    reset() {
      write(seed);
    },
  };
}

export function totalEarned(income: IncomeEntry[]) {
  return income.reduce((s, e) => s + e.amount, 0);
}
