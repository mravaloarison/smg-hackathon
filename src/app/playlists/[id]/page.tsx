"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/auth/AuthGate";
import PlaylistSongRow from "@/components/playlists/PlaylistSongRow";
import BackButton from "@/components/ui/BackButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import { removeSongFromPlaylist, subscribeToPlaylist } from "@/lib/firestore/playlists";
import { Playlist, PlaylistSong } from "@/lib/firestore/types";

function PlaylistDetailContent({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting a live subscription, not deriving state
    setIsLoading(true);
    return subscribeToPlaylist(playlistId, (data) => {
      setPlaylist(data);
      setIsLoading(false);
    });
  }, [playlistId]);

  async function handleRemove(song: PlaylistSong) {
    await removeSongFromPlaylist(playlistId, song);
  }

  return (
    <>
      <BackButton onClick={() => router.push("/playlists")} label="Back to playlists" />
      {isLoading && <LoadingSpinner />}
      {!isLoading && !playlist && (
        <ErrorMessage message="This playlist could not be found." />
      )}
      {!isLoading && playlist && (
        <>
          <h1 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {playlist.name}
          </h1>
          {playlist.songs.length === 0 ? (
            <EmptyState
              title="No songs yet"
              description="Add songs from a song's page to see them here."
            />
          ) : (
            <div className="flex flex-col gap-1">
              {playlist.songs.map((song) => (
                <PlaylistSongRow key={song.id} song={song} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
        <PlaylistDetailContent playlistId={id} />
      </main>
    </AuthGate>
  );
}
