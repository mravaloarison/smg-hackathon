"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/auth/AuthGate";
import CreatePlaylistForm from "@/components/playlists/CreatePlaylistForm";
import PlaylistCard from "@/components/playlists/PlaylistCard";
import InviteCollaboratorModal from "@/components/playlists/InviteCollaboratorModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import {
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  subscribeToCollaboratorPlaylists,
  subscribeToUserPlaylists,
} from "@/lib/firestore/playlists";
import { Playlist } from "@/lib/firestore/types";

function PlaylistsPageContent() {
  const { user, profile } = useAuth();
  const [ownedPlaylists, setOwnedPlaylists] = useState<Playlist[]>([]);
  const [collabPlaylists, setCollabPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [invitingPlaylist, setInvitingPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting a live subscription, not deriving state
    setIsLoading(true);
    let ownedLoaded = false;
    let collabLoaded = false;
    function checkDone() {
      if (ownedLoaded && collabLoaded) setIsLoading(false);
    }
    const unsubOwned = subscribeToUserPlaylists(user.uid, (data) => {
      setOwnedPlaylists(data);
      ownedLoaded = true;
      checkDone();
    });
    const unsubCollab = subscribeToCollaboratorPlaylists(user.uid, (data) => {
      setCollabPlaylists(data);
      collabLoaded = true;
      checkDone();
    });
    return () => { unsubOwned(); unsubCollab(); };
  }, [user]);

  const playlists = ownedPlaylists;

  async function handleCreate(name: string) {
    if (!user || !profile) return;
    setIsCreating(true);
    try {
      await createPlaylist(user.uid, profile.username, name);
    } finally {
      setIsCreating(false);
    }
  }

  function handleRename(playlist: Playlist) {
    setRenamingId(playlist.id);
    setRenameValue(playlist.name);
  }

  async function handleRenameSave(playlistId: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    await renamePlaylist(playlistId, trimmed);
    setRenamingId(null);
    setRenameValue("");
  }

  async function handleDelete(playlist: Playlist) {
    const confirmed = window.confirm(
      `Delete "${playlist.name}"? This can't be undone.`
    );
    if (!confirmed) return;
    setOwnedPlaylists((prev) => prev.filter((p) => p.id !== playlist.id));
    await deletePlaylist(playlist.id);
  }

  function handleInvite(playlist: Playlist) {
    setInvitingPlaylist(playlist);
  }

  return (
    <main className="flex w-full flex-col gap-6 px-6 py-10">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Playlists
      </h1>
      <div className="mx-auto w-full max-w-xl">
        <CreatePlaylistForm onCreate={handleCreate} isSubmitting={isCreating} />
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && ownedPlaylists.length === 0 && collabPlaylists.length === 0 && (
        <EmptyState
          title="No playlists yet"
          description="Create your first playlist above."
        />
      )}
      {!isLoading && ownedPlaylists.length > 0 && (
        <div className="flex flex-col gap-1">
          {ownedPlaylists.map((playlist) => {
            if (renamingId === playlist.id) {
              return (
                <form
                  key={playlist.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRenameSave(playlist.id);
                  }}
                  className="flex items-center gap-2 rounded-xl p-3"
                >
                  <input
                    type="text"
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-neutral-900 px-4 py-2.5 text-base font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="rounded-full border border-neutral-300 px-4 py-2.5 text-base font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                </form>
              );
            }
            return (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onRename={handleRename}
                onDelete={handleDelete}
                onInvite={handleInvite}
              />
            );
          })}
        </div>
      )}

      {!isLoading && collabPlaylists.length > 0 && (
        <div className="flex flex-col gap-3">
          <hr className="border-neutral-200 dark:border-neutral-800" />
          <h2 className="px-1 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Shared with me
          </h2>
          <div className="flex flex-col gap-1">
            {collabPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </div>
      )}

      {invitingPlaylist && (
        <InviteCollaboratorModal
          playlist={invitingPlaylist}
          onClose={() => setInvitingPlaylist(null)}
        />
      )}
    </main>
  );
}

export default function PlaylistsPage() {
  return (
    <AuthGate>
      <PlaylistsPageContent />
    </AuthGate>
  );
}
