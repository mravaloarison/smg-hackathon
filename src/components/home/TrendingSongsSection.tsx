import ResultsSection from "@/components/results/ResultsSection";
import SongTile from "@/components/results/SongTile";
import HorizontalScrollFade from "@/components/ui/HorizontalScrollFade";
import { Song } from "@/lib/itunes/types";

interface TrendingSongsSectionProps {
  songs: Song[];
  onSongClick: (song: Song) => void;
  onAddToPlaylist?: (song: Song) => void;
  title?: string;
}

export default function TrendingSongsSection({
  songs,
  onSongClick,
  onAddToPlaylist,
  title = "Trending Songs",
}: TrendingSongsSectionProps) {
  if (songs.length === 0) return null;

  return (
    <ResultsSection title={title}>
      <HorizontalScrollFade className="flex gap-4 pb-2">
        {songs.map((song) => (
          <div key={song.id} className="w-36 flex-shrink-0">
            <SongTile song={song} onClick={onSongClick} onAddToPlaylist={onAddToPlaylist} />
          </div>
        ))}
      </HorizontalScrollFade>
    </ResultsSection>
  );
}
