"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { searchUsersByUsername } from "@/lib/firestore/users";
import { sendCollabInvite } from "@/lib/firestore/invites";
import { Playlist, UserProfile } from "@/lib/firestore/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import Artwork from "@/components/ui/Artwork";

interface InviteCollaboratorModalProps {
  playlist: Playlist;
  onClose: () => void;
}

export default function InviteCollaboratorModal({
  playlist,
  onClose,
}: InviteCollaboratorModalProps) {
  const { user, profile } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const debouncedInput = useDebouncedValue(inputValue, 400);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    searchUsersByUsername(debouncedInput)
      .then((data) => {
        if (!cancelled) {
          // Exclude the playlist owner and current user from results
          setResults(data.filter((u) => u.uid !== user?.uid && u.uid !== playlist.ownerId));
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedInput, user?.uid, playlist.ownerId]);

  async function handleInvite(targetUser: UserProfile) {
    if (!user || !profile) return;
    setSentIds((prev) => new Set(prev).add(targetUser.uid));
    await sendCollabInvite({
      playlistId: playlist.id,
      playlistName: playlist.name,
      fromUid: user.uid,
      fromUsername: profile.username,
      toUid: targetUser.uid,
      toUsername: targetUser.username,
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
            Invite collaborator
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

        <p className="mb-4 text-base text-neutral-500 dark:text-neutral-400">
          Invite someone to collaborate on &ldquo;{playlist.name}&rdquo;
        </p>

        <input
          type="text"
          placeholder="Search by username..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />

        <div className="flex max-h-60 flex-col gap-1 overflow-y-auto">
          {isSearching && (
            <p className="px-2 py-3 text-base text-neutral-500 dark:text-neutral-400">
              Searching...
            </p>
          )}
          {!isSearching && debouncedInput.trim() && results.length === 0 && (
            <p className="px-2 py-3 text-base text-neutral-500 dark:text-neutral-400">
              No users found.
            </p>
          )}
          {!isSearching &&
            results.map((u) => {
              const sent = sentIds.has(u.uid);
              return (
                <div
                  key={u.uid}
                  className="flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <Artwork
                    src={u.photoURL ?? undefined}
                    alt={u.username}
                    size={36}
                    rounded="full"
                  />
                  <span className="flex-1 truncate text-base text-neutral-900 dark:text-neutral-100">
                    {u.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => !sent && handleInvite(u)}
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
