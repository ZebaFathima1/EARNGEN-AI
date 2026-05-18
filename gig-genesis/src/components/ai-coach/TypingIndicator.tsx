export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl glass-panel w-fit">
      <span className="text-xs text-muted-foreground mr-1">EARNGEN is thinking</span>
      <span className="size-1.5 rounded-full bg-brand typing-dot" />
      <span className="size-1.5 rounded-full bg-brand typing-dot" />
      <span className="size-1.5 rounded-full bg-brand typing-dot" />
    </div>
  );
}
