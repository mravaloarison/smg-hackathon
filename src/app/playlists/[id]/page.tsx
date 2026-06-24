"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/auth/AuthGate";
import PlaylistHeader from "@/components/playlists/PlaylistHeader";
import PlaylistSongRow from "@/components/playlists/PlaylistSongRow";
import InviteCollaboratorModal from "@/components/playlists/InviteCollaboratorModal";
import DeleteConfirmModal from "@/components/playlists/DeleteConfirmModal";
import BackButton from "@/components/ui/BackButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import {
  deletePlaylist,
  removeCollaborator,
  removeSongFromPlaylist,
  renamePlaylist,
  subscribeToPlaylist,
} from "@/lib/firestore/playlists";
import { getUserProfiles } from "@/lib/firestore/users";
import { Playlist, PlaylistSong, UserProfile } from "@/lib/firestore/types";

function PlaylistDetailContent({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting a live subscription, not deriving state
    setIsLoading(true);
    return subscribeToPlaylist(playlistId, (data) => {
      setPlaylist(data);
      setIsLoading(false);
    });
  }, [playlistId]);

  useEffect(() => {
    const ids = playlist?.collaboratorIds ?? [];
    if (ids.length === 0) {
      setCollaborators([]);
      return;
    }
    getUserProfiles(ids).then(setCollaborators).catch(() => {});
  }, [playlist?.collaboratorIds]);

  async function handleRemove(song: PlaylistSong) {
    await removeSongFromPlaylist(playlistId, song);
  }

  async function handleRename(newName: string) {
    setIsRenaming(true);
    try {
      await renamePlaylist(playlistId, newName);
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deletePlaylist(playlistId);
      router.push("/playlists");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleRemoveCollaborator(uid: string) {
    await removeCollaborator(playlistId, uid);
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
          <PlaylistHeader
            playlist={playlist}
            collaborators={collaborators}
            onRename={handleRename}
            onDelete={() => setShowDeleteModal(true)}
            onInvite={() => setIsInviting(true)}
            onRemoveCollaborator={handleRemoveCollaborator}
            isRenaming={isRenaming}
          />
          <hr className="mb-4 border-neutral-200 dark:border-neutral-800" />
          {playlist.songs.length === 0 ? (
            <EmptyState
              title="No songs yet"
              description="Add songs from a song's page to see them here."
            />
          ) : (
            <div className="flex flex-col gap-1">
              {playlist.songs.map((song, i) => (
                <PlaylistSongRow
                  key={song.id}
                  song={song}
                  songIndex={i}
                  playlistId={playlistId}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
          {isInviting && (
            <InviteCollaboratorModal
              playlist={playlist}
              onClose={() => setIsInviting(false)}
            />
          )}
          {showDeleteModal && (
            <DeleteConfirmModal
              playlistName={playlist.name}
              isLoading={isDeleting}
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteModal(false)}
            />
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
      <main className="mx-auto flex w-full flex-col px-4 py-6">
        <PlaylistDetailContent playlistId={id} />
      </main>
    </AuthGate>
  );
}
