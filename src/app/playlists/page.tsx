"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/auth/AuthGate";
import CreatePlaylistForm from "@/components/playlists/CreatePlaylistForm";
import PlaylistCard from "@/components/playlists/PlaylistCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { createPlaylist, subscribeToUserPlaylists } from "@/lib/firestore/playlists";
import { Playlist } from "@/lib/firestore/types";

function PlaylistsPageContent() {
  const { user, profile } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting a live subscription, not deriving state
    setIsLoading(true);
    return subscribeToUserPlaylists(user.uid, (data) => {
      setPlaylists(data);
      setIsLoading(false);
    });
  }, [user]);

  async function handleCreate(name: string) {
    if (!user || !profile) return;
    setIsCreating(true);
    try {
      await createPlaylist(user.uid, profile.username, name);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl w-full flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Playlists
      </h1>
      <CreatePlaylistForm onCreate={handleCreate} isSubmitting={isCreating} />

      {isLoading && <LoadingSpinner />}
      {!isLoading && playlists.length === 0 && (
        <EmptyState
          title="No playlists yet"
          description="Create your first playlist above."
        />
      )}
      {!isLoading && playlists.length > 0 && (
        <div className="flex flex-col gap-1">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
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
