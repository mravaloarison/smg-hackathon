import ArtistsSection from "@/components/results/ArtistsSection";
import AlbumsSection from "@/components/results/AlbumsSection";
import SongsSection from "@/components/results/SongsSection";
import EmptyState from "@/components/ui/EmptyState";
import { Album, Artist, SearchResults, Song } from "@/lib/itunes/types";

interface ResultsListProps {
  results: SearchResults;
  onSongClick: (song: Song) => void;
  onAlbumClick: (album: Album) => void;
  onArtistClick: (artist: Artist) => void;
  onArtistIdClick: (artistId: number) => void;
  onAddToPlaylist?: (song: Song) => void;
}

export default function ResultsList({
  results,
  onSongClick,
  onAlbumClick,
  onArtistClick,
  onArtistIdClick,
  onAddToPlaylist,
}: ResultsListProps) {
  const hasResults =
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.songs.length > 0;

  if (!hasResults) {
    return (
      <EmptyState
        title="No results found"
        description="Try searching for a different song, album, or artist."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ArtistsSection artists={results.artists} onArtistClick={onArtistClick} />
      <AlbumsSection
        albums={results.albums}
        onAlbumClick={onAlbumClick}
        onArtistClick={onArtistIdClick}
      />
      <SongsSection songs={results.songs} onSongClick={onSongClick} onAddToPlaylist={onAddToPlaylist} />
    </div>
  );
}
