import SongCard from "@/components/results/SongCard";
import ResultsSection from "@/components/results/ResultsSection";
import { Song } from "@/lib/itunes/types";

interface SongsSectionProps {
  songs: Song[];
  onSongClick: (song: Song) => void;
}

export default function SongsSection({ songs, onSongClick }: SongsSectionProps) {
  if (songs.length === 0) return null;

  return (
    <ResultsSection title="Songs">
      <div className="flex flex-col gap-1">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} onClick={onSongClick} />
        ))}
      </div>
    </ResultsSection>
  );
}
