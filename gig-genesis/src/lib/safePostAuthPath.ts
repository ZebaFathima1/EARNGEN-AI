/** After sign-in, only allow same-origin relative paths. Skills & roadmap (/) is excluded. */
export function safePostAuthPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/speak-with-ai";
  if (next === "/auth" || next === "/") return "/speak-with-ai";
  return next;
}
