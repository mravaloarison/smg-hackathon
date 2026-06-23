import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LyricsView from "@/components/lyrics/LyricsView";
import { LyricsResult } from "@/lib/lyrics/types";

interface LyricsSectionProps {
  isLoading: boolean;
  error: boolean;
  lyrics: LyricsResult | null;
}

export default function LyricsSection({ isLoading, error, lyrics }: LyricsSectionProps) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Lyrics
      </h2>
      {isLoading && <LoadingSpinner />}
      {!isLoading && error && <ErrorMessage message="Could not load lyrics." />}
      {!isLoading && !error && (
        <LyricsView
          plainLyrics={lyrics?.plainLyrics ?? null}
          instrumental={lyrics?.instrumental ?? false}
        />
      )}
    </div>
  );
}
