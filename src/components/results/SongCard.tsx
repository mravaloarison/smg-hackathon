"use client";

import Artwork from "@/components/ui/Artwork";
import { Song } from "@/lib/itunes/types";

interface SongCardProps {
  song: Song;
  onClick: (song: Song) => void;
  onAddToPlaylist?: (song: Song) => void;
}

export default function SongCard({ song, onClick, onAddToPlaylist }: SongCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(song)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(song);
      }}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg p-2 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Artwork src={song.artworkUrl} alt={song.title} size={56} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {song.title}
          </p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {song.artistName}
          </p>
        </div>
      </div>
      {onAddToPlaylist && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlaylist(song);
          }}
          aria-label={`Add ${song.title} to playlist`}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
