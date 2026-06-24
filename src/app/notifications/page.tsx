"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/auth/AuthGate";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToReceivedInvites, respondToInvite } from "@/lib/firestore/invites";
import { CollabInvite } from "@/lib/firestore/types";

type InviteStatus = "pending" | "accepted" | "declined";

interface InviteCardProps {
  invite: CollabInvite;
}

function InviteCard({ invite }: InviteCardProps) {
  const [localStatus, setLocalStatus] = useState<InviteStatus>("pending");
  const [isResponding, setIsResponding] = useState(false);

  async function handleRespond(accept: boolean) {
    setIsResponding(true);
    try {
      await respondToInvite(invite.id, invite.playlistId, invite.toUid, accept);
      setLocalStatus(accept ? "accepted" : "declined");
    } finally {
      setIsResponding(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
      <div>
        <p className="text-base text-neutral-900 dark:text-neutral-100">
          <span className="font-semibold">{invite.fromUsername}</span> invited you to collaborate on{" "}
          <span className="font-semibold">&ldquo;{invite.playlistName}&rdquo;</span>
        </p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {new Date(invite.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {localStatus === "pending" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleRespond(true)}
            disabled={isResponding}
            className="rounded-full bg-neutral-900 px-4 py-2.5 text-base font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {isResponding ? "Joining..." : "Accept"}
          </button>
          <button
            type="button"
            onClick={() => handleRespond(false)}
            disabled={isResponding}
            className="rounded-full border border-neutral-300 px-4 py-2.5 text-base font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Decline
          </button>
        </div>
      )}

      {localStatus === "accepted" && (
        <p className="text-base font-medium text-green-600 dark:text-green-400">
          Joined! You&apos;re now a collaborator.
        </p>
      )}

      {localStatus === "declined" && (
        <p className="text-base font-medium text-neutral-500 dark:text-neutral-400">
          Declined
        </p>
      )}
    </div>
  );
}

function NotificationsPageContent() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<CollabInvite[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToReceivedInvites(user.uid, setInvites);
  }, [user]);

  return (
    <main className="mx-auto flex max-w-2xl w-full flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Notifications
      </h1>

      {invites.length === 0 && (
        <EmptyState
          title="No notifications"
          description="When someone invites you to collaborate on a playlist, it will appear here."
        />
      )}

      {invites.length > 0 && (
        <div className="flex flex-col gap-3">
          {invites.map((invite) => (
            <InviteCard key={invite.id} invite={invite} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGate
      title="Sign in to view notifications"
      description="You need to be signed in to see your collaboration invites."
    >
      <NotificationsPageContent />
    </AuthGate>
  );
}
