import Artwork from "@/components/ui/Artwork";
import BackButton from "@/components/ui/BackButton";
import { Song } from "@/lib/itunes/types";

interface SongDetailViewProps {
  song: Song;
  onBack: () => void;
  onArtistClick?: (artistId: number) => void;
}

export default function SongDetailView({ song, onBack, onArtistClick }: SongDetailViewProps) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="flex flex-col items-center gap-6 py-6 text-center sm:flex-row sm:items-start sm:text-left">
        <Artwork src={song.artworkUrl} alt={song.title} size={220} />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {song.title}
          </h1>
          {song.artistId && onArtistClick ? (
            <button
              type="button"
              onClick={() => onArtistClick(song.artistId as number)}
              className="text-left text-lg text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {song.artistName}
            </button>
          ) : (
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              {song.artistName}
            </p>
          )}
          {song.albumName && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              From the album <span className="font-medium">{song.albumName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
