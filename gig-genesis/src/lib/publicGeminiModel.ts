import { DEFAULT_GEMINI_MODEL } from "@/lib/gemini";

/** Shown in the UI before sign-in. Set `VITE_GEMINI_MODEL` to match server `GEMINI_MODEL` in `.env`. */
export function getPublicGeminiModelLabel(): string {
  const v = import.meta.env.VITE_GEMINI_MODEL as string | undefined;
  return (v && v.trim()) || DEFAULT_GEMINI_MODEL;
}
