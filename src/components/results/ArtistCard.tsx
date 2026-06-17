"use client";

import Artwork from "@/components/ui/Artwork";
import { Artist } from "@/lib/itunes/types";

interface ArtistCardProps {
  artist: Artist;
  onClick?: (artist: Artist) => void;
}

export default function ArtistCard({ artist, onClick }: ArtistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(artist)}
      className="flex flex-col items-center gap-2 rounded-lg p-2 text-center transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <Artwork src={artist.artworkUrl} alt={artist.name} size={120} rounded="full" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {artist.name}
        </p>
        {artist.genre && (
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {artist.genre}
          </p>
        )}
      </div>
    </button>
  );
}
