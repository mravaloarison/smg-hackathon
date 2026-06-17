"use client";

import Artwork from "@/components/ui/Artwork";
import { Album } from "@/lib/itunes/types";

interface AlbumCardProps {
  album: Album;
  onClick?: (album: Album) => void;
  onArtistClick?: (artistId: number) => void;
}

export default function AlbumCard({ album, onClick, onArtistClick }: AlbumCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(album)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(album);
      }}
      className="flex w-full cursor-pointer flex-col gap-2 rounded-lg p-2 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <Artwork src={album.artworkUrl} alt={album.title} fluid />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {album.title}
        </p>
        {album.artistId && onArtistClick ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onArtistClick(album.artistId as number);
            }}
            className="block w-full truncate text-left text-xs text-neutral-500 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {album.artistName}
          </button>
        ) : (
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {album.artistName}
          </p>
        )}
      </div>
    </div>
  );
}
