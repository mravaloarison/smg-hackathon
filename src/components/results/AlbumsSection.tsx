import AlbumCard from "@/components/results/AlbumCard";
import ResultsSection from "@/components/results/ResultsSection";
import HorizontalScrollFade from "@/components/ui/HorizontalScrollFade";
import { Album } from "@/lib/itunes/types";

interface AlbumsSectionProps {
  albums: Album[];
  onAlbumClick?: (album: Album) => void;
  onArtistClick?: (artistId: number) => void;
  title?: string;
}

export default function AlbumsSection({
  albums,
  onAlbumClick,
  onArtistClick,
  title = "Albums",
}: AlbumsSectionProps) {
  if (albums.length === 0) return null;

  return (
    <ResultsSection title={title}>
      <HorizontalScrollFade className="flex gap-4 pb-2">
        {albums.map((album) => (
          <div key={album.id} className="w-36 flex-shrink-0">
            <AlbumCard album={album} onClick={onAlbumClick} onArtistClick={onArtistClick} />
          </div>
        ))}
      </HorizontalScrollFade>
    </ResultsSection>
  );
}
