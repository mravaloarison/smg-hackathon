"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Playlist } from "@/lib/firestore/types";
import PlaylistArtwork from "./PlaylistArtwork";

interface PlaylistCardProps {
  playlist: Playlist;
  showOwner?: boolean;
  onRename?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
  onInvite?: (playlist: Playlist) => void;
  onLeave?: (playlist: Playlist) => void;
}

export default function PlaylistCard({
  playlist,
  showOwner = false,
  onRename,
  onDelete,
  onInvite,
  onLeave,
}: PlaylistCardProps) {
  const hasActions = onRename || onDelete || onInvite || onLeave;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="relative flex items-center gap-3 rounded-xl p-3 transition hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <Link href={`/playlists/${playlist.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <PlaylistArtwork playlist={playlist} size={56} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {playlist.name}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {showOwner && <span>by {playlist.ownerUsername} · </span>}
            {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
          </p>
        </div>
      </Link>

      {hasActions && (
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
            aria-label="Playlist options"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM14 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              {onRename && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMenuOpen(false); onRename(playlist); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-neutral-400 dark:text-neutral-500" aria-hidden="true">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                  </svg>
                  Rename
                </button>
              )}
              {onInvite && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMenuOpen(false); onInvite(playlist); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-neutral-400 dark:text-neutral-500" aria-hidden="true">
                    <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM17.555 16.185a1 1 0 0 1-.887 1.312H3.332a1 1 0 0 1-.887-1.312l.347-1.107A4.003 4.003 0 0 1 6.613 12h6.774a4.003 4.003 0 0 1 3.821 2.878l.347 1.307ZM16 8a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1V8Z" />
                  </svg>
                  Invite a friend
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMenuOpen(false); onDelete(playlist); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.808a2.75 2.75 0 0 0 2.74-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              )}
              {onLeave && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMenuOpen(false); onLeave(playlist); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Zm9.47 4.22a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H7.75a.75.75 0 0 1 0-1.5h5.69l-.97-.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                  Leave playlist
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
