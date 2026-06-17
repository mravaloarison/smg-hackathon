import Artwork from "@/components/ui/Artwork";
import BackButton from "@/components/ui/BackButton";
import SongCard from "@/components/results/SongCard";
import { AlbumDetail, Song } from "@/lib/itunes/types";

interface AlbumDetailViewProps {
  albumDetail: AlbumDetail;
  onBack: () => void;
  onSongClick: (song: Song) => void;
  onArtistClick?: (artistId: number) => void;
}

export default function AlbumDetailView({
  albumDetail,
  onBack,
  onSongClick,
  onArtistClick,
}: AlbumDetailViewProps) {
  const { album, tracks } = albumDetail;

  return (
    <div>
      <BackButton onClick={onBack} label="Back" />
      <div className="flex flex-col items-center gap-6 py-6 text-center sm:flex-row sm:items-start sm:text-left">
        <Artwork src={album.artworkUrl} alt={album.title} size={220} />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {album.title}
          </h1>
          {album.artistId && onArtistClick ? (
            <button
              type="button"
              onClick={() => onArtistClick(album.artistId as number)}
              className="text-left text-lg text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {album.artistName}
            </button>
          ) : (
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              {album.artistName}
            </p>
          )}
          {album.genre && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {album.genre}
            </p>
          )}
        </div>
      </div>

      {tracks.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Tracks
          </h2>
          {tracks.map((track) => (
            <SongCard key={track.id} song={track} onClick={onSongClick} />
          ))}
        </div>
      )}
    </div>
  );
}
