"use client";

import Artwork from "@/components/ui/Artwork";
import { Song } from "@/lib/itunes/types";

interface SongCardProps {
  song: Song;
  onClick: (song: Song) => void;
}

export default function SongCard({ song, onClick }: SongCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(song)}
      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <Artwork src={song.artworkUrl} alt={song.title} size={56} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {song.title}
        </p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {song.artistName}
          {song.albumName ? ` — ${song.albumName}` : ""}
        </p>
      </div>
    </button>
  );
}
