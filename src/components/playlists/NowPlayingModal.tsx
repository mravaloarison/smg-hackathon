"use client";

import { useState } from "react";
import { PlaylistSong } from "@/lib/firestore/types";

interface NowPlayingModalProps {
  songs: PlaylistSong[];
  initialIndex?: number;
  onClose: () => void;
}

export default function NowPlayingModal({
  songs,
  initialIndex = 0,
  onClose,
}: NowPlayingModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const song = songs[index];
  const hasPrev = index > 0;
  const hasNext = index < songs.length - 1;

  if (!song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-neutral-200 bg-white px-6 py-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Artwork */}
        {song.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt={song.title}
            className="h-52 w-52 rounded-xl object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-52 w-52 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-800">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-20 w-20 text-neutral-400 dark:text-neutral-500" aria-hidden="true">
              <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
            </svg>
          </div>
        )}

        {/* Song info */}
        <div className="w-full text-center">
          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {song.title}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
            {song.artistName}
            {song.albumName ? ` — ${song.albumName}` : ""}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            disabled={!hasPrev}
            aria-label="Previous song"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M7.712 5.065A.75.75 0 0 1 8 5.75v2.954l5.212-3.57A.75.75 0 0 1 14.5 5.75v8.5a.75.75 0 0 1-1.288.546L8 11.296V14.25a.75.75 0 0 1-1.5 0v-8.5a.75.75 0 0 1 .288-.578Z" clipRule="evenodd" fillRule="evenodd" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            disabled={!hasNext}
            aria-label="Next song"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M12.288 5.065A.75.75 0 0 0 12 5.75v2.954L6.788 5.134A.75.75 0 0 0 5.5 5.75v8.5a.75.75 0 0 0 1.288.546L12 11.296V14.25a.75.75 0 0 0 1.5 0v-8.5a.75.75 0 0 0-.288-.578Z" clipRule="evenodd" fillRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Counter */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          {index + 1} / {songs.length}
        </p>
      </div>
    </div>
  );
}
