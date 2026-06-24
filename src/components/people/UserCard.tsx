"use client";

import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import { UserProfile } from "@/lib/firestore/types";
import { useAuth } from "@/contexts/AuthContext";

interface UserCardProps {
  user: UserProfile;
  onInvite?: (user: UserProfile) => void;
}

export default function UserCard({ user, onInvite }: UserCardProps) {
  const { user: currentUser } = useAuth();
  const showInvite = onInvite && currentUser && currentUser.uid !== user.uid;

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <Link
        href={`/profile/${user.uid}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Artwork src={user.photoURL ?? undefined} alt={user.username} size={48} rounded="full" />
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {user.username}
        </p>
      </Link>
      {showInvite && (
        <button
          type="button"
          onClick={() => onInvite(user)}
          aria-label={`Invite ${user.username} to a playlist`}
          title="Invite to playlist"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-violet-500 transition hover:bg-violet-50 hover:text-violet-600 dark:text-violet-400 dark:hover:bg-violet-950 dark:hover:text-violet-300"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM17.555 16.185a1 1 0 0 1-.887 1.312H3.332a1 1 0 0 1-.887-1.312l.347-1.107A4.003 4.003 0 0 1 6.613 12h6.774a4.003 4.003 0 0 1 3.821 2.878l.347 1.307ZM16 8a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1V8Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
