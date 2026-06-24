"use client";

import { useState } from "react";
import { sendCollabInvite } from "@/lib/firestore/invites";
import { Playlist, UserProfile } from "@/lib/firestore/types";
import PlaylistArtwork from "./PlaylistArtwork";
import Artwork from "@/components/ui/Artwork";

interface InviteToPlaylistModalProps {
  user: UserProfile;
  playlists: Playlist[];
  currentUser: { uid: string; username: string };
  onClose: () => void;
}

export default function InviteToPlaylistModal({
  user,
  playlists,
  currentUser,
  onClose,
}: InviteToPlaylistModalProps) {
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  async function handleInvite(playlist: Playlist) {
    setSentIds((prev) => new Set(prev).add(playlist.id));
    await sendCollabInvite({
      playlistId: playlist.id,
      playlistName: playlist.name,
      fromUid: currentUser.uid,
      fromUsername: currentUser.username,
      toUid: user.uid,
      toUsername: user.username,
    });
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Invite to playlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Artwork
            src={user.photoURL ?? undefined}
            alt={user.username}
            size={44}
            rounded="full"
          />
          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {user.username}
          </p>
        </div>

        <p className="mb-4 text-base text-neutral-500 dark:text-neutral-400">
          Choose a playlist to invite {user.username} to:
        </p>

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {playlists.length === 0 && (
            <p className="py-3 text-base text-neutral-500 dark:text-neutral-400">
              You have no playlists yet.
            </p>
          )}
          {playlists.map((playlist) => {
            const sent = sentIds.has(playlist.id);
            return (
              <div
                key={playlist.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2"
              >
                <PlaylistArtwork playlist={playlist} size={36} />
                <span className="flex-1 truncate text-base text-neutral-900 dark:text-neutral-100">
                  {playlist.name}
                </span>
                <button
                  type="button"
                  onClick={() => !sent && handleInvite(playlist)}
                  disabled={sent}
                  className={`rounded-full px-4 py-2.5 text-base font-medium transition ${
                    sent
                      ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                      : "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                  }`}
                >
                  {sent ? "Sent!" : "Invite"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
