"use client";

import Artwork from "@/components/ui/Artwork";
import { Song } from "@/lib/itunes/types";

interface SongTileProps {
  song: Song;
  onClick?: (song: Song) => void;
  onAddToPlaylist?: (song: Song) => void;
}

export default function SongTile({ song, onClick, onAddToPlaylist }: SongTileProps) {
  return (
    <div className="group relative flex w-full flex-col gap-2 rounded-lg p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <div className="relative">
        <button
          type="button"
          onClick={() => onClick?.(song)}
          className="w-full text-left"
        >
          <Artwork src={song.artworkUrl} alt={song.title} fluid />
        </button>
        {onAddToPlaylist && (
          <button
            type="button"
            onClick={() => onAddToPlaylist(song)}
            aria-label={`Add ${song.title} to playlist`}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow transition hover:bg-black/80 group-hover:opacity-100"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onClick?.(song)}
        className="min-w-0 text-left"
      >
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {song.title}
        </p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {song.artistName}
        </p>
      </button>
    </div>
  );
}
