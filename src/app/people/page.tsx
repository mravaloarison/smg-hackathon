"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/auth/AuthGate";
import SearchBar from "@/components/search/SearchBar";
import UserCard from "@/components/people/UserCard";
import InviteToPlaylistModal from "@/components/playlists/InviteToPlaylistModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchUsersByUsername } from "@/lib/firestore/users";
import { subscribeToUserPlaylists } from "@/lib/firestore/playlists";
import { Playlist, UserProfile } from "@/lib/firestore/types";
import { useAuth } from "@/contexts/AuthContext";

function PeoplePageContent() {
  const { user, profile } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const debouncedInput = useDebouncedValue(inputValue, 400);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userToInvite, setUserToInvite] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToUserPlaylists(user.uid, setPlaylists);
  }, [user]);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setIsLoading(true);
    setError(false);

    searchUsersByUsername(debouncedInput)
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedInput]);

  return (
    <main className="flex w-full flex-col gap-6 px-6 py-10">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        People
      </h1>
      <div className="mx-auto w-full max-w-xl">
        <SearchBar
          value={inputValue}
          onChange={setInputValue}
          placeholder="Search for users by username..."
        />
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && error && <ErrorMessage message="Could not search users." />}
      {!isLoading && !error && !debouncedInput.trim() && (
        <EmptyState
          title="Find people"
          description="Search for other users by their username."
        />
      )}
      {!isLoading && !error && debouncedInput.trim() && users.length === 0 && (
        <EmptyState title="No users found" description="Try a different username." />
      )}
      {!isLoading && !error && users.length > 0 && (
        <div className="flex flex-col gap-1">
          {users.map((u) => (
            <UserCard key={u.uid} user={u} onInvite={setUserToInvite} />
          ))}
        </div>
      )}

      {userToInvite && user && profile && (
        <InviteToPlaylistModal
          user={userToInvite}
          playlists={playlists}
          currentUser={{ uid: user.uid, username: profile.username }}
          onClose={() => setUserToInvite(null)}
        />
      )}
    </main>
  );
}

export default function PeoplePage() {
  return (
    <AuthGate>
      <PeoplePageContent />
    </AuthGate>
  );
}
