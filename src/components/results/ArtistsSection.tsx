import ArtistCard from "@/components/results/ArtistCard";
import ResultsSection from "@/components/results/ResultsSection";
import HorizontalScrollFade from "@/components/ui/HorizontalScrollFade";
import { Artist } from "@/lib/itunes/types";

interface ArtistsSectionProps {
  artists: Artist[];
  onArtistClick?: (artist: Artist) => void;
}

export default function ArtistsSection({ artists, onArtistClick }: ArtistsSectionProps) {
  if (artists.length === 0) return null;

  return (
    <ResultsSection title="Artists">
      <HorizontalScrollFade className="flex gap-4 pb-2">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} onClick={onArtistClick} />
        ))}
      </HorizontalScrollFade>
    </ResultsSection>
  );
}
