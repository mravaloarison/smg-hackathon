"use client";

import { useEffect, useState } from "react";
import CreatePlaylistForm from "@/components/playlists/CreatePlaylistForm";
import { useAuth } from "@/contexts/AuthContext";
import { addSongToPlaylist, createPlaylist, subscribeToUserPlaylists } from "@/lib/firestore/playlists";
import { Playlist } from "@/lib/firestore/types";
import { Song } from "@/lib/itunes/types";

interface AddToPlaylistModalProps {
  song: Song;
  onClose: () => void;
}

export default function AddToPlaylistModal({ song, onClose }: AddToPlaylistModalProps) {
  const { user, profile } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPlaylists(user.uid, setPlaylists);
  }, [user]);

  async function handleAdd(playlistId: string) {
    setAddedIds((prev) => new Set(prev).add(playlistId));
    await addSongToPlaylist(playlistId, {
      id: song.id,
      title: song.title,
      artistName: song.artistName,
      albumName: song.albumName,
      artworkUrl: song.artworkUrl,
    });
  }

  async function handleCreateAndAdd(name: string) {
    if (!user || !profile) return;
    const playlistId = await createPlaylist(user.uid, profile.username, name);
    await handleAdd(playlistId);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Add to Playlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="mb-5 flex max-h-64 flex-col gap-1 overflow-y-auto">
          {playlists.length === 0 && (
            <p className="text-base text-neutral-500 dark:text-neutral-400">
              No playlists yet. Create one below.
            </p>
          )}
          {playlists.map((playlist) => {
            const alreadyIn =
              playlist.songs.some((s) => s.id === song.id) || addedIds.has(playlist.id);
            return (
              <button
                key={playlist.id}
                type="button"
                onClick={() => !alreadyIn && handleAdd(playlist.id)}
                disabled={alreadyIn}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-base font-medium text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-60 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <span>{playlist.name}</span>
                {alreadyIn && <span className="text-sm text-neutral-400">Added</span>}
              </button>
            );
          })}
        </div>

        <CreatePlaylistForm onCreate={handleCreateAndAdd} />
      </div>
    </div>
  );
}
