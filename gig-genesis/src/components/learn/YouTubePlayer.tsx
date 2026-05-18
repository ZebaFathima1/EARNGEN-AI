export function YouTubePlayer({
  videoId,
  playlistId,
  title,
}: {
  videoId: string;
  playlistId?: string;
  title: string;
}) {
  const src = playlistId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?list=${playlistId}&rel=0`
    : `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-black aspect-video shadow-[0_0_60px_-20px_var(--color-brand)]">
      <iframe
        title={title}
        src={src}
        className="absolute inset-0 size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
