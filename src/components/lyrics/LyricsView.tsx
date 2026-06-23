interface LyricsViewProps {
  plainLyrics: string | null;
  instrumental: boolean;
}

export default function LyricsView({ plainLyrics, instrumental }: LyricsViewProps) {
  if (instrumental) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        This track is instrumental.
      </p>
    );
  }

  if (!plainLyrics) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No lyrics found for this track.
      </p>
    );
  }

  return (
    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
      {plainLyrics}
    </pre>
  );
}
