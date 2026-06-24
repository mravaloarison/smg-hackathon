import Artwork from "@/components/ui/Artwork";
import BackButton from "@/components/ui/BackButton";
import AlbumCard from "@/components/results/AlbumCard";
import { Album, ArtistDetail } from "@/lib/itunes/types";

interface ArtistDetailViewProps {
  artistDetail: ArtistDetail;
  onBack: () => void;
  onAlbumClick: (album: Album) => void;
  onArtistClick?: (artistId: number) => void;
}

export default function ArtistDetailView({
  artistDetail,
  onBack,
  onAlbumClick,
  onArtistClick,
}: ArtistDetailViewProps) {
  const { artist, albums } = artistDetail;

  return (
    <div>
      <BackButton onClick={onBack} label="Back" />
      <div className="flex flex-col items-center gap-4 pb-6 text-center">
        <Artwork src={artist.artworkUrl} alt={artist.name} size={160} rounded="full" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {artist.name}
          </h1>
          {artist.genre && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {artist.genre}
            </p>
          )}
        </div>
      </div>

      {albums.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Albums
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={onAlbumClick}
                onArtistClick={onArtistClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
