"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/auth/AuthGate";
import SearchBar from "@/components/search/SearchBar";
import UserCard from "@/components/people/UserCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchUsersByUsername } from "@/lib/firestore/users";
import { UserProfile } from "@/lib/firestore/types";

function PeoplePageContent() {
  const [inputValue, setInputValue] = useState("");
  const debouncedInput = useDebouncedValue(inputValue, 400);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

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
    <main className="mx-auto flex max-w-3xl w-full flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        People
      </h1>
      <SearchBar
        value={inputValue}
        onChange={setInputValue}
        placeholder="Search for users by username..."
      />

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
            <UserCard key={u.uid} user={u} />
          ))}
        </div>
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
